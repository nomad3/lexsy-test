// backend/src/services/KnowledgeGraphService.ts
import { db } from '../config/knex';
import { AIAgentService } from './AIAgentService';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface KnowledgeGraphEntity {
  id: string;
  entityType: string;
  entityValue: string;
  sourceDocumentId?: string;
  sourceDocumentType?: string;
  relationships: Record<string, any>;
  confidence: number;
  firstSeen: Date;
  lastUpdated: Date;
  usageCount: number;
}

export interface EntitySuggestion {
  entityValue: string;
  confidence: number;
  source: string;
  usageCount: number;
  lastUsed: Date;
}

export interface SearchEntityResult {
  entities: KnowledgeGraphEntity[];
  total: number;
}

/**
 * KnowledgeGraphService
 * Manages knowledge graph and entity matching
 */
export class KnowledgeGraphService {
  private aiAgentService: AIAgentService;

  constructor() {
    this.aiAgentService = new AIAgentService();
  }

  /**
   * Add a new entity to the knowledge graph
   * @param entityType - Type of entity (e.g., company_name, valuation_cap)
   * @param entityValue - Value of the entity
   * @param sourceDocumentId - Optional source document ID
   * @param sourceDocumentType - Optional source document type
   * @param confidence - Confidence score (0-1)
   * @returns Promise<KnowledgeGraphEntity> - Created entity
   */
  async addEntity(
    entityType: string,
    entityValue: string,
    sourceDocumentId?: string,
    sourceDocumentType?: string,
    confidence: number = 1.0
  ): Promise<KnowledgeGraphEntity> {
    try {
      logger.info('Adding entity to knowledge graph', { entityType, entityValue });

      // Validate confidence
      if (confidence < 0 || confidence > 1) {
        throw new Error('Confidence must be between 0 and 1');
      }

      // Check if entity already exists
      const existing = await db('knowledge_graph')
        .where({ entity_type: entityType, entity_value: entityValue })
        .first();

      if (existing) {
        // Update existing entity
        const [updated] = await db('knowledge_graph')
          .where({ id: existing.id })
          .update({
            last_updated: db.fn.now(),
            usage_count: db.raw('usage_count + 1'),
            confidence: Math.max(existing.confidence, confidence),
          })
          .returning('*');

        logger.info('Entity updated in knowledge graph', { entityId: updated.id });

        return this.mapDbEntityToKnowledgeGraphEntity(updated);
      } else {
        // Insert new entity
        const entityId = uuidv4();
        const [created] = await db('knowledge_graph').insert({
          id: entityId,
          entity_type: entityType,
          entity_value: entityValue,
          source_document_id: sourceDocumentId,
          source_document_type: sourceDocumentType,
          relationships: {},
          confidence,
          usage_count: 1,
        }).returning('*');

        logger.info('Entity added to knowledge graph', { entityId: created.id });

        return this.mapDbEntityToKnowledgeGraphEntity(created);
      }
    } catch (error) {
      logger.error('Error adding entity to knowledge graph', { error, entityType, entityValue });
      throw error;
    }
  }

  /**
   * Search for entities in the knowledge graph
   * @param entityType - Type of entity to search for
   * @param searchTerm - Optional search term for filtering
   * @param limit - Maximum number of results
   * @param offset - Offset for pagination
   * @returns Promise<SearchEntityResult> - Search results
   */
  async searchEntities(
    entityType?: string,
    searchTerm?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<SearchEntityResult> {
    try {
      logger.info('Searching knowledge graph', { entityType, searchTerm, limit, offset });

      let query = db('knowledge_graph').select('*');

      // Filter by entity type if provided
      if (entityType) {
        query = query.where({ entity_type: entityType });
      }

      // Filter by search term if provided
      if (searchTerm) {
        query = query.where('entity_value', 'ilike', `%${searchTerm}%`);
      }

      // Get total count
      const countQuery = query.clone();
      const [{ count }] = await countQuery.count('* as count');

      // Get paginated results
      const entities = await query
        .orderBy('usage_count', 'desc')
        .orderBy('last_updated', 'desc')
        .limit(limit)
        .offset(offset);

      logger.info('Knowledge graph search completed', {
        total: parseInt(count as string),
        returned: entities.length,
      });

      return {
        entities: entities.map(e => this.mapDbEntityToKnowledgeGraphEntity(e)),
        total: parseInt(count as string),
      };
    } catch (error) {
      logger.error('Error searching knowledge graph', { error, entityType, searchTerm });
      throw error;
    }
  }

  /**
   * Get entity suggestions for a placeholder using AI
   * @param placeholderId - ID of the placeholder
   * @param fieldName - Name of the field
   * @param fieldType - Type of the field
   * @param userId - ID of the user
   * @returns Promise<EntitySuggestion[]> - Array of suggestions
   */
  async getEntitySuggestions(
    placeholderId: string,
    fieldName: string,
    fieldType: string,
    userId: string
  ): Promise<EntitySuggestion[]> {
    try {
      logger.info('Getting entity suggestions', { placeholderId, fieldName, userId });

      // Get placeholder details
      const placeholder = await db('placeholders')
        .select('placeholders.*', 'documents.user_id')
        .join('documents', 'placeholders.document_id', 'documents.id')
        .where({ 'placeholders.id': placeholderId })
        .first();

      if (!placeholder) {
        throw new Error('Placeholder not found');
      }

      if (placeholder.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      // Search knowledge graph for matching entities
      const matchingEntities = await db('knowledge_graph')
        .select('*')
        .where('entity_type', 'ilike', `%${fieldName}%`)
        .orWhere('entity_type', 'ilike', `%${fieldType}%`)
        .orderBy('usage_count', 'desc')
        .orderBy('confidence', 'desc')
        .limit(5);

      // Use EntityMatcher agent for intelligent suggestions
      let aiSuggestions: EntitySuggestion[] = [];

      if (matchingEntities.length > 0) {
        try {
          const matchTask = await this.aiAgentService.runAgent('EntityMatcher', {
            placeholderId,
            fieldName,
            fieldType,
            knownEntities: matchingEntities.map(e => ({
              type: e.entity_type,
              value: e.entity_value,
              confidence: e.confidence,
              usageCount: e.usage_count,
            })),
          });

          const matchResult = matchTask.outputData as {
            suggestions: Array<{
              value: string;
              confidence: number;
              reasoning: string;
            }>;
          };

          aiSuggestions = matchResult.suggestions.map(s => ({
            entityValue: s.value,
            confidence: s.confidence,
            source: 'AI Suggestion',
            usageCount: 0,
            lastUsed: new Date(),
          }));
        } catch (error) {
          logger.warn('AI entity matching failed, using direct matches', { error });
        }
      }

      // Combine knowledge graph entities with AI suggestions
      const suggestions: EntitySuggestion[] = [
        ...matchingEntities.map(e => ({
          entityValue: e.entity_value,
          confidence: e.confidence,
          source: e.source_document_type || 'Knowledge Graph',
          usageCount: e.usage_count,
          lastUsed: new Date(e.last_updated),
        })),
        ...aiSuggestions,
      ];

      // Remove duplicates and sort by confidence
      const uniqueSuggestions = suggestions
        .filter((s, index, self) =>
          index === self.findIndex(t => t.entityValue === s.entityValue)
        )
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

      logger.info('Entity suggestions generated', {
        placeholderId,
        suggestionsCount: uniqueSuggestions.length,
      });

      return uniqueSuggestions;
    } catch (error) {
      logger.error('Error getting entity suggestions', { error, placeholderId, userId });
      throw error;
    }
  }

  /**
   * Update entity usage count
   * @param entityType - Type of the entity
   * @param entityValue - Value of the entity
   * @returns Promise<void>
   */
  async updateEntityUsage(entityType: string, entityValue: string): Promise<void> {
    try {
      logger.info('Updating entity usage', { entityType, entityValue });

      const entity = await db('knowledge_graph')
        .where({ entity_type: entityType, entity_value: entityValue })
        .first();

      if (entity) {
        await db('knowledge_graph')
          .where({ id: entity.id })
          .update({
            usage_count: db.raw('usage_count + 1'),
            last_updated: db.fn.now(),
          });

        logger.info('Entity usage updated', { entityId: entity.id });
      } else {
        // Create new entity if it doesn't exist
        await this.addEntity(entityType, entityValue, undefined, undefined, 1.0);
      }
    } catch (error) {
      logger.error('Error updating entity usage', { error, entityType, entityValue });
      throw error;
    }
  }

  /**
   * Get entities by source document
   * @param sourceDocumentId - ID of the source document
   * @returns Promise<KnowledgeGraphEntity[]> - Array of entities
   */
  async getEntitiesBySourceDocument(sourceDocumentId: string): Promise<KnowledgeGraphEntity[]> {
    try {
      logger.info('Fetching entities by source document', { sourceDocumentId });

      const entities = await db('knowledge_graph')
        .where({ source_document_id: sourceDocumentId })
        .orderBy('confidence', 'desc');

      logger.info('Entities fetched', { count: entities.length });

      return entities.map(e => this.mapDbEntityToKnowledgeGraphEntity(e));
    } catch (error) {
      logger.error('Error fetching entities by source document', { error, sourceDocumentId });
      throw error;
    }
  }

  /**
   * Map database row to KnowledgeGraphEntity type
   * @private
   */
  private mapDbEntityToKnowledgeGraphEntity(dbEntity: any): KnowledgeGraphEntity {
    return {
      id: dbEntity.id,
      entityType: dbEntity.entity_type,
      entityValue: dbEntity.entity_value,
      sourceDocumentId: dbEntity.source_document_id,
      sourceDocumentType: dbEntity.source_document_type,
      relationships: typeof dbEntity.relationships === 'string'
        ? JSON.parse(dbEntity.relationships)
        : dbEntity.relationships,
      confidence: dbEntity.confidence,
      firstSeen: new Date(dbEntity.first_seen),
      lastUpdated: new Date(dbEntity.last_updated),
      usageCount: dbEntity.usage_count || 0,
    };
  }
}
