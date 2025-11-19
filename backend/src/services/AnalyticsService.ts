// backend/src/services/AnalyticsService.ts
import { db } from '../config/knex';
import { AIAgentService } from './AIAgentService';
import { logger } from '../utils/logger';

export interface DashboardMetrics {
  totalDocuments: number;
  completedDocuments: number;
  inProgressDocuments: number;
  averageCompletionPercentage: number;
  totalPlaceholders: number;
  filledPlaceholders: number;
  averageDocumentHealthScore: number;
  recentActivity: ActivityItem[];
  documentsByType: Record<string, number>;
  documentsByStatus: Record<string, number>;
}

export interface ActivityItem {
  id: string;
  type: 'document_uploaded' | 'document_completed' | 'data_room_upload' | 'insight_generated';
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DocumentInsights {
  documentId: string;
  insights: Insight[];
  healthScore: number;
  recommendations: Recommendation[];
  riskFactors: RiskFactor[];
}

export interface Insight {
  id: string;
  type: 'anomaly' | 'pattern' | 'suggestion' | 'risk';
  title: string;
  description: string;
  confidence: number;
  createdAt: Date;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export interface RiskFactor {
  factor: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
}

export interface CompanyAnalytics {
  companyName: string;
  totalDocuments: number;
  documentTypes: string[];
  totalEntities: number;
  averageQualityScore: number;
  keyInsights: string[];
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  date: Date;
  event: string;
  documentType: string;
}

/**
 * AnalyticsService
 * Generates business intelligence and insights
 */
export class AnalyticsService {
  private aiAgentService: AIAgentService;

  constructor() {
    this.aiAgentService = new AIAgentService();
  }

  /**
   * Get dashboard metrics for a user
   * @param userId - ID of the user
   * @returns Promise<DashboardMetrics> - Dashboard metrics
   */
  async getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    try {
      logger.info('Generating dashboard metrics', { userId });

      // Get document counts
      const [totalDocs] = await db('documents')
        .where({ user_id: userId })
        .count('* as count');

      const [completedDocs] = await db('documents')
        .where({ user_id: userId, status: 'completed' })
        .count('* as count');

      const [inProgressDocs] = await db('documents')
        .where({ user_id: userId, status: 'filling' })
        .count('* as count');

      // Get average completion percentage
      const [avgCompletion] = await db('documents')
        .where({ user_id: userId })
        .avg('completion_percentage as average');

      // Get placeholder counts
      const placeholderStats = await db('placeholders')
        .select(
          db.raw('COUNT(*) as total'),
          db.raw('COUNT(filled_value) as filled')
        )
        .join('documents', 'placeholders.document_id', 'documents.id')
        .where({ 'documents.user_id': userId })
        .first();

      // Get average health score
      const avgHealth = await db('health_checks')
        .select(db.raw('AVG(overall_score) as average'))
        .join('documents', 'health_checks.document_id', 'documents.id')
        .where({ 'documents.user_id': userId })
        .first();

      // Get documents by type
      const docsByType = await db('documents')
        .select('document_type')
        .count('* as count')
        .where({ user_id: userId })
        .whereNotNull('document_type')
        .groupBy('document_type');

      const documentsByType: Record<string, number> = {};
      docsByType.forEach(row => {
        documentsByType[row.document_type] = parseInt(row.count as string);
      });

      // Get documents by status
      const docsByStatus = await db('documents')
        .select('status')
        .count('* as count')
        .where({ user_id: userId })
        .groupBy('status');

      const documentsByStatus: Record<string, number> = {};
      docsByStatus.forEach(row => {
        documentsByStatus[row.status] = parseInt(row.count as string);
      });

      // Get recent activity
      const recentActivity = await this.getRecentActivity(userId, 10);

      const metrics: DashboardMetrics = {
        totalDocuments: parseInt(totalDocs.count as string),
        completedDocuments: parseInt(completedDocs.count as string),
        inProgressDocuments: parseInt(inProgressDocs.count as string),
        averageCompletionPercentage: Math.round(parseFloat(avgCompletion?.average || '0')),
        totalPlaceholders: parseInt(placeholderStats?.total || '0'),
        filledPlaceholders: parseInt(placeholderStats?.filled || '0'),
        averageDocumentHealthScore: Math.round(parseFloat(avgHealth?.average || '0')),
        recentActivity,
        documentsByType,
        documentsByStatus,
      };

      logger.info('Dashboard metrics generated', { userId, totalDocuments: metrics.totalDocuments });

      return metrics;
    } catch (error) {
      logger.error('Error generating dashboard metrics', { error, userId });
      throw error;
    }
  }

  /**
   * Get insights for a specific document
   * @param documentId - ID of the document
   * @param userId - ID of the user
   * @returns Promise<DocumentInsights> - Document insights
   */
  async getDocumentInsights(documentId: string, userId: string): Promise<DocumentInsights> {
    try {
      logger.info('Generating document insights', { documentId, userId });

      // Verify document belongs to user
      const document = await db('documents')
        .where({ id: documentId, user_id: userId })
        .first();

      if (!document) {
        throw new Error('Document not found');
      }

      // Get AI insights for this document
      const aiInsights = await db('ai_insights')
        .where({ entity_type: 'document', entity_id: documentId })
        .orderBy('created_at', 'desc')
        .limit(10);

      const insights: Insight[] = aiInsights.map(insight => ({
        id: insight.id,
        type: insight.insight_type,
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence,
        createdAt: new Date(insight.created_at),
      }));

      // Get health check for document
      const healthCheck = await db('health_checks')
        .where({ document_id: documentId })
        .orderBy('checked_at', 'desc')
        .first();

      const healthScore = healthCheck?.overall_score || 0;
      const recommendations: Recommendation[] = healthCheck?.recommendations || [];
      const issues = healthCheck?.issues || [];

      // Convert issues to risk factors
      const riskFactors: RiskFactor[] = issues.map((issue: any) => ({
        factor: issue.field || 'Unknown',
        severity: issue.severity || 'info',
        description: issue.description || '',
      }));

      // If no AI insights exist, generate them using InsightsEngine
      if (insights.length === 0) {
        try {
          const placeholders = await db('placeholders')
            .where({ document_id: documentId });

          const insightsTask = await this.aiAgentService.runAgent('InsightsEngine', {
            documentId,
            documentType: document.document_type,
            placeholders,
            healthScore,
          });

          const generatedInsights = insightsTask.outputData as {
            insights: Array<{
              type: string;
              title: string;
              description: string;
              confidence: number;
            }>;
          };

          // Store generated insights
          for (const insight of generatedInsights.insights) {
            const [created] = await db('ai_insights').insert({
              insight_type: insight.type,
              entity_type: 'document',
              entity_id: documentId,
              title: insight.title,
              description: insight.description,
              confidence: insight.confidence,
              agent_id: insightsTask.agentId,
              metadata: {},
            }).returning('*');

            insights.push({
              id: created.id,
              type: created.insight_type,
              title: created.title,
              description: created.description,
              confidence: created.confidence,
              createdAt: new Date(created.created_at),
            });
          }
        } catch (error) {
          logger.warn('Failed to generate AI insights', { error, documentId });
        }
      }

      logger.info('Document insights generated', { documentId, insightsCount: insights.length });

      return {
        documentId,
        insights,
        healthScore,
        recommendations,
        riskFactors,
      };
    } catch (error) {
      logger.error('Error generating document insights', { error, documentId, userId });
      throw error;
    }
  }

  /**
   * Get analytics for a specific company
   * @param companyName - Name of the company
   * @param userId - ID of the user
   * @returns Promise<CompanyAnalytics> - Company analytics
   */
  async getCompanyAnalytics(companyName: string, userId: string): Promise<CompanyAnalytics> {
    try {
      logger.info('Generating company analytics', { companyName, userId });

      // Get data room documents for this company
      const documents = await db('data_room_documents')
        .where({ user_id: userId, company_name: companyName })
        .orderBy('upload_date', 'asc');

      // Get document types
      const documentTypes = [...new Set(documents.map(d => d.document_type))];

      // Get total entities
      const [entityCount] = await db('knowledge_graph')
        .count('* as count')
        .whereIn('source_document_id', documents.map(d => d.id));

      // Calculate average quality score
      const avgQuality = documents.reduce((sum, doc) => sum + (doc.quality_score || 0), 0) / (documents.length || 1);

      // Get AI-generated insights for this company
      const aiInsights = await db('ai_insights')
        .select('title', 'description')
        .where({ entity_type: 'company', entity_id: companyName })
        .orderBy('confidence', 'desc')
        .limit(5);

      const keyInsights = aiInsights.map(insight => insight.description);

      // If no insights exist, generate them
      if (keyInsights.length === 0 && documents.length > 0) {
        try {
          const entities = await db('knowledge_graph')
            .whereIn('source_document_id', documents.map(d => d.id))
            .limit(100);

          const insightsTask = await this.aiAgentService.runAgent('InsightsEngine', {
            companyName,
            documents: documents.map(d => ({
              type: d.document_type,
              summary: d.ai_summary,
              qualityScore: d.quality_score,
            })),
            entities: entities.map(e => ({
              type: e.entity_type,
              value: e.entity_value,
            })),
          });

          const generatedInsights = insightsTask.outputData as {
            insights: Array<{
              title: string;
              description: string;
            }>;
          };

          generatedInsights.insights.forEach(insight => {
            keyInsights.push(insight.description);
          });
        } catch (error) {
          logger.warn('Failed to generate company insights', { error, companyName });
        }
      }

      // Create timeline
      const timeline: TimelineEvent[] = documents.map(doc => ({
        date: new Date(doc.upload_date),
        event: `${doc.document_type} uploaded`,
        documentType: doc.document_type,
      }));

      const analytics: CompanyAnalytics = {
        companyName,
        totalDocuments: documents.length,
        documentTypes,
        totalEntities: parseInt(entityCount?.count as string || '0'),
        averageQualityScore: Math.round(avgQuality * 100) / 100,
        keyInsights: keyInsights.slice(0, 5),
        timeline,
      };

      logger.info('Company analytics generated', { companyName, totalDocuments: analytics.totalDocuments });

      return analytics;
    } catch (error) {
      logger.error('Error generating company analytics', { error, companyName, userId });
      throw error;
    }
  }

  /**
   * Get recent activity for a user
   * @private
   */
  private async getRecentActivity(userId: string, limit: number = 10): Promise<ActivityItem[]> {
    try {
      const activities: ActivityItem[] = [];

      // Get recent document uploads
      const recentDocuments = await db('documents')
        .where({ user_id: userId })
        .orderBy('upload_date', 'desc')
        .limit(limit);

      recentDocuments.forEach(doc => {
        activities.push({
          id: doc.id,
          type: doc.status === 'completed' ? 'document_completed' : 'document_uploaded',
          description: `${doc.status === 'completed' ? 'Completed' : 'Uploaded'} ${doc.document_type || 'document'}: ${doc.filename}`,
          timestamp: new Date(doc.upload_date),
          metadata: { documentId: doc.id, documentType: doc.document_type },
        });
      });

      // Get recent data room uploads
      const recentDataRoomDocs = await db('data_room_documents')
        .where({ user_id: userId })
        .orderBy('upload_date', 'desc')
        .limit(limit);

      recentDataRoomDocs.forEach(doc => {
        activities.push({
          id: doc.id,
          type: 'data_room_upload',
          description: `Added ${doc.document_type} for ${doc.company_name} to data room`,
          timestamp: new Date(doc.upload_date),
          metadata: { companyName: doc.company_name, documentType: doc.document_type },
        });
      });

      // Get recent insights
      const recentInsights = await db('ai_insights')
        .select('ai_insights.*')
        .join('documents', function() {
          this.on('ai_insights.entity_id', '=', 'documents.id')
            .andOn('ai_insights.entity_type', '=', db.raw('?', ['document']));
        })
        .where({ 'documents.user_id': userId })
        .orderBy('ai_insights.created_at', 'desc')
        .limit(limit);

      recentInsights.forEach(insight => {
        activities.push({
          id: insight.id,
          type: 'insight_generated',
          description: insight.title,
          timestamp: new Date(insight.created_at),
          metadata: { insightType: insight.insight_type, confidence: insight.confidence },
        });
      });

      // Sort all activities by timestamp and limit
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      logger.error('Error getting recent activity', { error, userId });
      return [];
    }
  }
}
