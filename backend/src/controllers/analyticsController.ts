import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';

const analyticsService = new AnalyticsService();

/**
 * Get dashboard metrics for the authenticated user
 * GET /api/analytics/dashboard
 */
export const getDashboardMetrics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const metrics = await analyticsService.getDashboardMetrics(req.user.id);

  logger.info('Dashboard metrics retrieved', {
    userId: req.user.id,
  });

  res.status(200).json({
    success: true,
    data: { metrics },
  });
});

/**
 * Get insights for a specific document
 * GET /api/analytics/documents/:id/insights
 */
export const getDocumentInsights = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;

  if (!id) {
    throw createError('Document ID is required', 400, 'MISSING_ID');
  }

  try {
    const insights = await analyticsService.getDocumentInsights(id, req.user.id);

    logger.info('Document insights retrieved', {
      userId: req.user.id,
      documentId: id,
    });

    res.status(200).json({
      success: true,
      data: { insights },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Document not found') {
      throw createError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
    }
    throw error;
  }
});

/**
 * Get analytics for a specific company
 * GET /api/analytics/companies/:company
 */
export const getCompanyAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { company } = req.params;

  if (!company) {
    throw createError('Company name is required', 400, 'MISSING_COMPANY');
  }

  try {
    const analytics = await analyticsService.getCompanyAnalytics(company, req.user.id);

    logger.info('Company analytics retrieved', {
      userId: req.user.id,
      company,
    });

    res.status(200).json({
      success: true,
      data: { analytics },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'No data found for company') {
      throw createError('No data found for this company', 404, 'COMPANY_NOT_FOUND');
    }
    throw error;
  }
});
