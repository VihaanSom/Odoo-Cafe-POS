/**
 * Upload Service - Azure Blob Storage
 * Handles image uploads to Azure Blob Storage
 */
const { BlobServiceClient } = require('@azure/storage-blob');

// Azure Storage Configuration
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'product-images';

/**
 * Get Azure Blob Service Client
 */
const getBlobServiceClient = () => {
    if (!accountName || !accountKey) {
        throw new Error('Azure Storage credentials not configured');
    }

    const connectionString = `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`;
    return BlobServiceClient.fromConnectionString(connectionString);
};

/**
 * Upload image to Azure Blob Storage
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Original filename
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Public URL of uploaded blob
 */
const uploadImage = async (buffer, fileName, mimeType) => {
    try {
        const blobServiceClient = getBlobServiceClient();
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Ensure container exists (with public access for images)
        await containerClient.createIfNotExists({
            access: 'blob' // Public read access for blobs only
        });

        // Generate unique blob name with timestamp
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const blobName = `products/${timestamp}-${sanitizedFileName}`;

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload with content type
        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: {
                blobContentType: mimeType
            }
        });

        // Return the public URL
        return blockBlobClient.url;
    } catch (error) {
        console.error('Azure Blob upload error:', error.message);
        console.error('Azure Blob upload error details:', error);
        throw new Error(`Failed to upload image to storage: ${error.message}`);
    }
};

/**
 * Delete image from Azure Blob Storage
 * @param {string} imageUrl - Full URL of the blob to delete
 * @returns {Promise<boolean>}
 */
const deleteImage = async (imageUrl) => {
    try {
        if (!imageUrl || !imageUrl.includes('blob.core.windows.net')) {
            return false;
        }

        const blobServiceClient = getBlobServiceClient();
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Extract blob name from URL
        const urlParts = new URL(imageUrl);
        const blobName = urlParts.pathname.split(`/${containerName}/`)[1];

        if (blobName) {
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.deleteIfExists();
            return true;
        }

        return false;
    } catch (error) {
        console.error('Azure Blob delete error:', error);
        return false;
    }
};

module.exports = {
    uploadImage,
    deleteImage,
};
