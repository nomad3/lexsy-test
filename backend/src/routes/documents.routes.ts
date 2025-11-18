import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/authenticate';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  analyzeDocument,
  extractPlaceholders,
} from '../controllers/documentController';
import { config } from '../config/app';

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
    cb(null, `document-${uniqueSuffix}${ext}`);
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
 * POST /api/documents/upload
 * Upload a new document (authenticated)
 */
router.post('/upload', authenticate, upload.single('document'), uploadDocument);

/**
 * GET /api/documents
 * Get all documents for authenticated user
 */
router.get('/', authenticate, getDocuments);

/**
 * GET /api/documents/:id
 * Get a single document by ID (authenticated)
 */
router.get('/:id', authenticate, getDocument);

/**
 * POST /api/documents/:id/analyze
 * Trigger document analysis (authenticated)
 */
router.post('/:id/analyze', authenticate, analyzeDocument);

/**
 * POST /api/documents/:id/placeholders
 * Extract placeholders from document (authenticated)
 */
router.post('/:id/placeholders', authenticate, extractPlaceholders);

export default router;
