import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { DataRoomService } from '../services/DataRoomService';
import { logger } from '../utils/logger';

const dataRoomService = new DataRoomService();

/**
 * Upload a document to the data room
 * POST /api/dataroom/upload
 */
export const uploadDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw createError('No file uploaded', 400, 'NO_FILE');
  }

  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { companyName, documentType } = req.body;

  if (!companyName) {
    throw createError('Company name is required', 400, 'MISSING_COMPANY_NAME');
  }

  if (!documentType) {
    throw createError('Document type is required', 400, 'MISSING_DOCUMENT_TYPE');
  }

  // Validate file type (only .docx files)
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    throw createError('Invalid file type. Only .docx files are allowed', 400, 'INVALID_FILE_TYPE');
  }

  const document = await dataRoomService.uploadDocument(
    req.user.id,
    companyName,
    documentType,
    req.file
  );

  logger.info('Data room document uploaded', {
    userId: req.user.id,
    documentId: document.id,
    companyName,
    documentType,
  });

  res.status(201).json({
    success: true,
    data: { document },
  });
});

/**
 * Get all data room documents for the authenticated user
 * GET /api/dataroom/documents
 */
export const getDocuments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const documents = await dataRoomService.getDocuments(req.user.id);

  res.status(200).json({
    success: true,
    data: { documents },
  });
});

/**
 * Get data room statistics
 * GET /api/dataroom/stats
 */
export const getStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const stats = await dataRoomService.getStats(req.user.id);

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * Process a data room document to extract entities
 * POST /api/dataroom/documents/:id/process
 */
export const processDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;

  if (!id) {
    throw createError('Document ID is required', 400, 'MISSING_ID');
  }

  try {
    const result = await dataRoomService.processDocument(id, req.user.id);

    logger.info('Data room document processed', {
      userId: req.user.id,
      documentId: id,
      entitiesExtracted: result.entitiesExtracted,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Data room document not found') {
      throw createError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }
    throw error;
  }
});

/**
 * Delete a data room document
 * DELETE /api/dataroom/documents/:id
 */
export const deleteDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;

  if (!id) {
    throw createError('Document ID is required', 400, 'MISSING_ID');
  }

  try {
    await dataRoomService.deleteDocument(id, req.user.id);

    logger.info('Data room document deleted', {
      userId: req.user.id,
      documentId: id,
    });

    res.status(200).json({
      success: true,
      data: { message: 'Document deleted successfully' },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Data room document not found') {
      throw createError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }
    throw error;
  }
});
