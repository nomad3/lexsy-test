// backend/src/services/DataRoomService.ts
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/knex';
import { parseDocx } from '../utils/docxParser';
import { logger } from '../utils/logger';
import { AIAgentService } from './AIAgentService';

export interface DataRoomDocument {
  id: string;
  userId: string;
  companyName: string;
  documentType: string;
  filePath: string;
  uploadDate: Date;
  processingStatus: 'uploaded' | 'extracting' | 'indexed' | 'failed';
  aiSummary?: string;
  keyEntitiesCount: number;
  qualityScore?: number;
}

export interface ProcessingResult {
  documentId: string;
  entitiesExtracted: number;
  summary: string;
  qualityScore: number;
}

/**
 * DataRoomService
 * Manages data room documents and entity extraction
 */
export class DataRoomService {
  private aiAgentService: AIAgentService;

  constructor() {
    this.aiAgentService = new AIAgentService();
  }

  /**
   * Upload a document to the data room
   * @param userId - ID of the user
   * @param companyName - Name of the company
   * @param documentType - Type of document
   * @param file - Multer file object
   * @returns Promise<DataRoomDocument> - Created data room document
   */
  async uploadDocument(
    userId: string,
    companyName: string,
    documentType: string,
    file: Express.Multer.File
  ): Promise<DataRoomDocument> {
    try {
      logger.info('Uploading data room document', { userId, companyName, documentType });

      if (!file) {
        throw new Error('File is required');
      }

      // Verify user exists
      const user = await db('users').where({ id: userId }).first();
      if (!user) {
        throw new Error('User not found');
      }

      // Create data room document record
      const documentId = uuidv4();
      const [dbDocument] = await db('data_room_documents').insert({
        id: documentId,
        user_id: userId,
        company_name: companyName,
        document_type: documentType,
        file_path: file.path,
        processing_status: 'uploaded',
        key_entities_count: 0,
      }).returning('*');

      logger.info('Data room document uploaded successfully', { documentId });

      return this.mapDbDocumentToDataRoomDocument(dbDocument);
    } catch (error) {
      logger.error('Error uploading data room document', { error, userId, companyName });
      throw error;
    }
  }

  /**
   * Process a data room document to extract entities
   * @param documentId - ID of the document to process
   * @param userId - ID of the user
   * @returns Promise<ProcessingResult> - Processing results
   */
  async processDocument(documentId: string, userId: string): Promise<ProcessingResult> {
    try {
      logger.info('Processing data room document', { documentId, userId });

      // Get document and verify ownership
      const dbDocument = await db('data_room_documents')
        .where({ id: documentId, user_id: userId })
        .first();

      if (!dbDocument) {
        throw new Error('Data room document not found');
      }

      // Update status to extracting
      await db('data_room_documents')
        .where({ id: documentId })
        .update({ processing_status: 'extracting' });

      // Parse document text
      const text = await parseDocx(dbDocument.file_path);

      // Run template analyzer agent to extract entities
      const analysisTask = await this.aiAgentService.runAgent('TemplateAnalyzer', {
        documentId,
        text,
        companyName: dbDocument.company_name,
        documentType: dbDocument.document_type,
      });

      const analysisResult = analysisTask.outputData as {
        entities: Array<{
          type: string;
          value: string;
          confidence: number;
        }>;
        summary: string;
        qualityScore: number;
      };

      // Store entities in knowledge graph
      const entities = analysisResult.entities || [];
      for (const entity of entities) {
        await this.addEntityToKnowledgeGraph(
          entity.type,
          entity.value,
          documentId,
          dbDocument.document_type,
          entity.confidence
        );
      }

      // Update document with processing results
      await db('data_room_documents')
        .where({ id: documentId })
        .update({
          processing_status: 'indexed',
          ai_summary: analysisResult.summary,
          key_entities_count: entities.length,
          quality_score: analysisResult.qualityScore,
        });

      logger.info('Data room document processed successfully', {
        documentId,
        entitiesExtracted: entities.length,
      });

      return {
        documentId,
        entitiesExtracted: entities.length,
        summary: analysisResult.summary,
        qualityScore: analysisResult.qualityScore,
      };
    } catch (error) {
      logger.error('Error processing data room document', { error, documentId, userId });

      // Update status to failed
      await db('data_room_documents')
        .where({ id: documentId })
        .update({ processing_status: 'failed' });

      throw error;
    }
  }

  /**
   * Get data room statistics for a user
   * @param userId - ID of the user
   * @returns Promise<{ totalDocuments: number; entitiesExtracted: number; suggestionsMade: number }>
   */
  async getStats(userId: string): Promise<{ totalDocuments: number; entitiesExtracted: number; suggestionsMade: number }> {
    try {
      logger.info('Fetching data room stats', { userId });

      // Get total documents
      const [totalDocs] = await db('data_room_documents')
        .where({ user_id: userId })
        .count('* as count');

      // Get total entities extracted
      const [entities] = await db('data_room_documents')
        .where({ user_id: userId })
        .sum('key_entities_count as total');

      // Get total suggestions made (usage count of entities from user's documents)
      const [suggestions] = await db('knowledge_graph')
        .join('data_room_documents', 'knowledge_graph.source_document_id', 'data_room_documents.id')
        .where({ 'data_room_documents.user_id': userId })
        .sum('knowledge_graph.usage_count as total');

      return {
        totalDocuments: parseInt(totalDocs.count as string),
        entitiesExtracted: parseInt(entities.total as string || '0'),
        suggestionsMade: parseInt(suggestions.total as string || '0'),
      };
    } catch (error) {
      logger.error('Error fetching data room stats', { error, userId });
      throw error;
    }
  }

  /**
   * Get all data room documents for a user
   * @param userId - ID of the user
   * @param companyName - Optional filter by company name
   * @returns Promise<DataRoomDocument[]> - Array of data room documents
   */
  async getDocuments(userId: string, companyName?: string): Promise<DataRoomDocument[]> {
    try {
      logger.info('Fetching data room documents', { userId, companyName });

      let query = db('data_room_documents')
        .where({ user_id: userId });

      if (companyName) {
        query = query.where({ company_name: companyName });
      }

      const dbDocuments = await query.orderBy('upload_date', 'desc');

      logger.info('Data room documents fetched', { count: dbDocuments.length });

      return dbDocuments.map(dbDoc => this.mapDbDocumentToDataRoomDocument(dbDoc));
    } catch (error) {
      logger.error('Error fetching data room documents', { error, userId, companyName });
      throw error;
    }
  }

  /**
   * Delete a data room document
   * @param documentId - ID of the document to delete
   * @param userId - ID of the user
   * @returns Promise<void>
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    try {
      logger.info('Deleting data room document', { documentId, userId });

      // Verify document exists and belongs to user
      const document = await db('data_room_documents')
        .where({ id: documentId, user_id: userId })
        .first();

      if (!document) {
        throw new Error('Data room document not found');
      }

      // Delete knowledge graph entries linked to this document
      await db('knowledge_graph')
        .where({ source_document_id: documentId })
        .delete();

      // Delete the document
      await db('data_room_documents')
        .where({ id: documentId })
        .delete();

      logger.info('Data room document deleted successfully', { documentId });
    } catch (error) {
      logger.error('Error deleting data room document', { error, documentId, userId });
      throw error;
    }
  }

  /**
   * Add an entity to the knowledge graph
   * @private
   */
  private async addEntityToKnowledgeGraph(
    entityType: string,
    entityValue: string,
    sourceDocumentId: string,
    sourceDocumentType: string,
    confidence: number
  ): Promise<void> {
    try {
      // Check if entity already exists
      const existing = await db('knowledge_graph')
        .where({ entity_type: entityType, entity_value: entityValue })
        .first();

      if (existing) {
        // Update existing entity
        await db('knowledge_graph')
          .where({ id: existing.id })
          .update({
            last_updated: db.fn.now(),
            usage_count: db.raw('usage_count + 1'),
            confidence: Math.max(existing.confidence, confidence),
          });
      } else {
        // Insert new entity
        await db('knowledge_graph').insert({
          id: uuidv4(),
          entity_type: entityType,
          entity_value: entityValue,
          source_document_id: sourceDocumentId,
          source_document_type: sourceDocumentType,
          relationships: {},
          confidence,
          usage_count: 1,
        });
      }

      logger.debug('Entity added to knowledge graph', { entityType, entityValue });
    } catch (error) {
      logger.error('Error adding entity to knowledge graph', {
        error,
        entityType,
        entityValue,
      });
      // Don't throw - entity extraction failures shouldn't break the whole process
    }
  }

  /**
   * Map database row to DataRoomDocument type
   * @private
   */
  private mapDbDocumentToDataRoomDocument(dbDoc: any): DataRoomDocument {
    return {
      id: dbDoc.id,
      userId: dbDoc.user_id,
      companyName: dbDoc.company_name,
      documentType: dbDoc.document_type,
      filePath: dbDoc.file_path,
      uploadDate: new Date(dbDoc.upload_date),
      processingStatus: dbDoc.processing_status,
      aiSummary: dbDoc.ai_summary,
      keyEntitiesCount: dbDoc.key_entities_count || 0,
      qualityScore: dbDoc.quality_score,
    };
  }
}
