/**
 * Upload Controller
 * Handles image upload requests
 */
const uploadService = require('../services/upload.service');

/**
 * Upload image
 * POST /api/upload/image
 */
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const { buffer, originalname, mimetype } = req.file;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(mimetype)) {
            return res.status(400).json({
                message: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP'
            });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (buffer.length > maxSize) {
            return res.status(400).json({
                message: 'File too large. Maximum size is 5MB'
            });
        }

        const imageUrl = await uploadService.uploadImage(buffer, originalname, mimetype);

        res.json({
            success: true,
            imageUrl
        });
    } catch (error) {
        console.error('Upload controller error:', error);
        next(error);
    }
};

/**
 * Delete image
 * DELETE /api/upload/image
 */
const deleteImage = async (req, res, next) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        const deleted = await uploadService.deleteImage(imageUrl);

        res.json({
            success: deleted,
            message: deleted ? 'Image deleted' : 'Image not found or already deleted'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadImage,
    deleteImage,
};
