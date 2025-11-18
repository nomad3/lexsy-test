import { Request, Response } from 'express';
import { DocumentService } from '../services/DocumentService';
import { logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';

const documentService = new DocumentService();

/**
 * Upload a new document
 * POST /api/documents/upload
 */
export const uploadDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw createError('No file uploaded', 400, 'NO_FILE');
  }

  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  // Validate file type (only .docx files)
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    throw createError('Invalid file type. Only .docx files are allowed', 400, 'INVALID_FILE_TYPE');
  }

  const document = await documentService.uploadDocument(req.user.id, req.file);

  logger.info('Document uploaded', {
    userId: req.user.id,
    documentId: document.id,
    filename: document.filename,
  });

  res.status(201).json({
    success: true,
    data: { document },
  });
});

/**
 * Get all documents for the authenticated user
 * GET /api/documents
 */
export const getDocuments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const documents = await documentService.getDocuments(req.user.id);

  res.status(200).json({
    success: true,
    data: { documents },
  });
});

/**
 * Get a single document by ID
 * GET /api/documents/:id
 */
export const getDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;

  if (!id) {
    throw createError('Document ID is required', 400, 'MISSING_ID');
  }

  try {
    const document = await documentService.getDocument(id, req.user.id);

    res.status(200).json({
      success: true,
      data: { document },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Document not found') {
      throw createError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }
    throw error;
  }
});

/**
 * Analyze a document using AI
 * POST /api/documents/:id/analyze
 */
export const analyzeDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;

  if (!id) {
    throw createError('Document ID is required', 400, 'MISSING_ID');
  }

  try {
    const analysis = await documentService.analyzeDocument(id, req.user.id);

    logger.info('Document analyzed', {
      userId: req.user.id,
      documentId: id,
      documentType: analysis.documentType,
    });

    res.status(200).json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Document not found') {
      throw createError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }
    throw error;
  }
});

/**
 * Extract placeholders from a document
 * POST /api/documents/:id/placeholders
 */
export const extractPlaceholders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;

  if (!id) {
    throw createError('Document ID is required', 400, 'MISSING_ID');
  }

  try {
    const placeholders = await documentService.extractPlaceholders(id, req.user.id);

    logger.info('Placeholders extracted', {
      userId: req.user.id,
      documentId: id,
      count: placeholders.length,
    });

    res.status(200).json({
      success: true,
      data: { placeholders },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Document not found') {
      throw createError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }
    throw error;
  }
});
