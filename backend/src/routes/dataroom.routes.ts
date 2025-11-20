import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { config } from '../config/app';
import {
  deleteDocument,
  getDocuments,
  getStats,
  processDocument,
  uploadDocument,
} from '../controllers/dataroomController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.fileUploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `dataroom - ${uniqueSuffix}${ext} `);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Only accept .docx files
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .docx files are allowed'));
    }
  },
});

/**
 * POST /api/dataroom/upload
 * Upload a document to the data room (authenticated)
 */
router.post('/upload', authenticate, upload.single('document'), uploadDocument);

/**
 * GET /api/dataroom/documents
 * Get all data room documents for authenticated user
 */
router.get('/documents', authenticate, getDocuments);

/**
 * GET /api/dataroom/stats
 * Get data room statistics (authenticated)
 */
router.get('/stats', authenticate, getStats);

/**
 * POST /api/dataroom/documents/:id/process
 * Process a data room document to extract entities (authenticated)
 */
router.post('/documents/:id/process', authenticate, processDocument);

/**
 * DELETE /api/dataroom/documents/:id
 * Delete a data room document (authenticated)
 */
router.delete('/documents/:id', authenticate, deleteDocument);

export default router;
