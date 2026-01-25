/**
 * Upload Routes
 * Routes for image upload functionality
 */
const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/upload.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Configure multer for memory storage (no disk storage needed)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// POST /api/upload/image - Upload a single image
router.post('/image', authMiddleware, upload.single('image'), uploadController.uploadImage);

// DELETE /api/upload/image - Delete an image
router.delete('/image', authMiddleware, uploadController.deleteImage);

module.exports = router;
