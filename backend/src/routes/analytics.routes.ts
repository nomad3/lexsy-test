import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  getDashboardMetrics,
  getDocumentInsights,
  getCompanyAnalytics,
} from '../controllers/analyticsController';

const router = Router();

/**
 * GET /api/analytics/dashboard
 * Get dashboard metrics for authenticated user
 */
router.get('/dashboard', authenticate, getDashboardMetrics);

/**
 * GET /api/analytics/documents/:id/insights
 * Get insights for a specific document (authenticated)
 */
router.get('/documents/:id/insights', authenticate, getDocumentInsights);

/**
 * GET /api/analytics/companies/:company
 * Get analytics for a specific company (authenticated)
 */
router.get('/companies/:company', authenticate, getCompanyAnalytics);

export default router;
