// backend/src/services/ConversationService.ts
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/knex';
import { logger } from '../utils/logger';

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  documentId: string;
  userId: string;
  status: 'active' | 'completed' | 'paused';
  currentPlaceholder?: string;
  metadata: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
}

export interface StartConversationResult {
  conversation: Conversation;
  initialMessage: ConversationMessage;
}

/**
 * ConversationService
 * Manages conversational filling sessions for documents
 */
export class ConversationService {
  /**
   * Start a new conversation for filling a document
   * @param documentId - ID of the document to fill
   * @param userId - ID of the user
   * @returns Promise<StartConversationResult> - New conversation and initial message
   */
  async startConversation(documentId: string, userId: string): Promise<StartConversationResult> {
    try {
      logger.info('Starting conversation', { documentId, userId });

      // Verify document exists and belongs to user
      const document = await db('documents')
        .where({ id: documentId, user_id: userId })
        .first();

      if (!document) {
        throw new Error('Document not found');
      }

      // Get unfilled placeholders
      const placeholders = await db('placeholders')
        .where({ document_id: documentId })
        .whereNull('filled_value')
        .orderBy('position', 'asc');

      if (placeholders.length === 0) {
        throw new Error('No placeholders to fill');
      }

      // Create conversation record
      const conversationId = uuidv4();
      const conversation: Conversation = {
        id: conversationId,
        documentId,
        userId,
        status: 'active',
        currentPlaceholder: placeholders[0].id,
        metadata: {
          totalPlaceholders: placeholders.length,
          filledCount: 0,
        },
        startedAt: new Date(),
      };

      // Store conversation in metadata (we'll use a simple approach for now)
      await db('documents')
        .where({ id: documentId })
        .update({
          status: 'filling',
          metadata: db.raw(`
            jsonb_set(
              COALESCE(metadata, '{}'::jsonb),
              '{conversation}',
              ?::jsonb
            )
          `, [JSON.stringify(conversation)])
        });

      // Generate initial message with examples
      const firstPlaceholder = placeholders[0];
      const exampleText = this.getExampleForField(firstPlaceholder.field_name, firstPlaceholder.field_type);

      const initialMessage: ConversationMessage = {
        id: uuidv4(),
        conversationId,
        role: 'assistant',
        content: `Hi! I'll help you fill out this ${document.document_type || 'document'}. I found ${placeholders.length} field${placeholders.length > 1 ? 's' : ''} to complete.\n\nLet's start with: **${firstPlaceholder.field_name}**\n${exampleText}\n\nWhat value should we use?`,
        timestamp: new Date(),
        metadata: {
          placeholderId: firstPlaceholder.id,
          fieldName: firstPlaceholder.field_name,
          fieldType: firstPlaceholder.field_type,
        },
      };

      logger.info('Conversation started successfully', { conversationId });

      return { conversation, initialMessage };
    } catch (error) {
      logger.error('Error starting conversation', { error, documentId, userId });
      throw error;
    }
  }

  /**
   * Send a message in a conversation
   * @param conversationId - ID of the conversation
   * @param userId - ID of the user
   * @param message - Message content
   * @returns Promise<ConversationMessage> - Assistant's response
   */
  async sendMessage(
    conversationId: string,
    userId: string,
    message: string
  ): Promise<ConversationMessage> {
    try {
      logger.info('Processing conversation message', { conversationId, userId });

      // Get conversation from document metadata
      const document = await db('documents')
        .where({ user_id: userId })
        .whereRaw(`metadata->>'conversation' IS NOT NULL`)
        .whereRaw(`metadata->'conversation'->>'id' = ?`, [conversationId])
        .first();

      if (!document) {
        throw new Error('Conversation not found');
      }

      const conversation = document.metadata.conversation as Conversation;

      if (conversation.status !== 'active') {
        throw new Error('Conversation is not active');
      }

      // Get current placeholder
      const currentPlaceholder = await db('placeholders')
        .where({ id: conversation.currentPlaceholder })
        .first();

      if (!currentPlaceholder) {
        throw new Error('Current placeholder not found');
      }

      // Fill the placeholder with the user's message
      await this.fillPlaceholder(document.id, currentPlaceholder.id, message, userId);

      // Get next unfilled placeholder
      const nextPlaceholder = await db('placeholders')
        .where({ document_id: document.id })
        .whereNull('filled_value')
        .orderBy('position', 'asc')
        .first();

      let responseContent: string;
      let updatedConversation = conversation;

      if (nextPlaceholder) {
        // Move to next placeholder
        const exampleText = this.getExampleForField(nextPlaceholder.field_name, nextPlaceholder.field_type);
        responseContent = `Great! I've recorded "**${message}**" for **${currentPlaceholder.field_name}**.\n\nNow, let's fill in: **${nextPlaceholder.field_name}**\n${exampleText}\n\nWhat value should we use?`;

        updatedConversation = {
          ...conversation,
          currentPlaceholder: nextPlaceholder.id,
          metadata: {
            ...conversation.metadata,
            filledCount: (conversation.metadata.filledCount || 0) + 1,
          },
        };
      } else {
        // Conversation complete
        responseContent = `Perfect! I've recorded "${message}" for ${currentPlaceholder.field_name}. That was the last field. Your document is now complete!`;

        updatedConversation = {
          ...conversation,
          status: 'completed',
          currentPlaceholder: undefined,
          completedAt: new Date(),
          metadata: {
            ...conversation.metadata,
            filledCount: conversation.metadata.totalPlaceholders,
          },
        };

        // Update document status
        await db('documents')
          .where({ id: document.id })
          .update({
            status: 'completed',
            completion_percentage: 100,
          });
      }

      // Update conversation in metadata
      await db('documents')
        .where({ id: document.id })
        .update({
          metadata: db.raw(`
            jsonb_set(
              COALESCE(metadata, '{}'::jsonb),
              '{conversation}',
              ?::jsonb
            )
          `, [JSON.stringify(updatedConversation)])
        });

      const response: ConversationMessage = {
        id: uuidv4(),
        conversationId,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        metadata: nextPlaceholder ? {
          placeholderId: nextPlaceholder.id,
          fieldName: nextPlaceholder.field_name,
          fieldType: nextPlaceholder.field_type,
        } : {},
      };

      logger.info('Message processed successfully', { conversationId });

      return response;
    } catch (error) {
      logger.error('Error processing message', { error, conversationId, userId });
      throw error;
    }
  }

  /**
   * Get conversation history
   * @param conversationId - ID of the conversation
   * @param userId - ID of the user
   * @returns Promise<Conversation> - Conversation with messages
   */
  async getConversationHistory(conversationId: string, userId: string): Promise<Conversation> {
    try {
      logger.info('Fetching conversation history', { conversationId, userId });

      const document = await db('documents')
        .where({ user_id: userId })
        .whereRaw(`metadata->>'conversation' IS NOT NULL`)
        .whereRaw(`metadata->'conversation'->>'id' = ?`, [conversationId])
        .first();

      if (!document) {
        throw new Error('Conversation not found');
      }

      const conversation = document.metadata.conversation as Conversation;

      logger.info('Conversation history retrieved', { conversationId });

      return conversation;
    } catch (error) {
      logger.error('Error fetching conversation history', { error, conversationId, userId });
      throw error;
    }
  }

  /**
   * Fill a placeholder with a value
   * @param documentId - ID of the document
   * @param placeholderId - ID of the placeholder
   * @param value - Value to fill
   * @param userId - ID of the user
   * @returns Promise<void>
   */
  async fillPlaceholder(
    documentId: string,
    placeholderId: string,
    value: string,
    userId: string
  ): Promise<void> {
    try {
      logger.info('Filling placeholder', { documentId, placeholderId, userId });

      // Verify document belongs to user
      const document = await db('documents')
        .where({ id: documentId, user_id: userId })
        .first();

      if (!document) {
        throw new Error('Document not found');
      }

      // Update placeholder
      await db('placeholders')
        .where({ id: placeholderId, document_id: documentId })
        .update({
          filled_value: value,
          validation_status: 'validated',
        });

      // Update document completion percentage
      const totalPlaceholders = await db('placeholders')
        .where({ document_id: documentId })
        .count('* as count')
        .first();

      const filledPlaceholders = await db('placeholders')
        .where({ document_id: documentId })
        .whereNotNull('filled_value')
        .count('* as count')
        .first();

      const total = parseInt(totalPlaceholders?.count as string || '0');
      const filled = parseInt(filledPlaceholders?.count as string || '0');
      const completionPercentage = total > 0 ? Math.round((filled / total) * 100) : 0;

      await db('documents')
        .where({ id: documentId })
        .update({ completion_percentage: completionPercentage });

      logger.info('Placeholder filled successfully', { placeholderId, completionPercentage });
    } catch (error) {
      logger.error('Error filling placeholder', { error, placeholderId, userId });
      throw error;
    }
  }

  /**
   * Complete a conversation
   * @param conversationId - ID of the conversation
   * @param userId - ID of the user
   * @returns Promise<void>
   */
  async completeConversation(conversationId: string, userId: string): Promise<void> {
    try {
      logger.info('Completing conversation', { conversationId, userId });

      const document = await db('documents')
        .where({ user_id: userId })
        .whereRaw(`metadata->>'conversation' IS NOT NULL`)
        .whereRaw(`metadata->'conversation'->>'id' = ?`, [conversationId])
        .first();

      if (!document) {
        throw new Error('Conversation not found');
      }

      const conversation = document.metadata.conversation as Conversation;

      const updatedConversation = {
        ...conversation,
        status: 'completed',
        completedAt: new Date(),
      };

      await db('documents')
        .where({ id: document.id })
        .update({
          status: 'completed',
          metadata: db.raw(`
            jsonb_set(
              COALESCE(metadata, '{}'::jsonb),
              '{conversation}',
              ?::jsonb
            )
          `, [JSON.stringify(updatedConversation)])
        });

      logger.info('Conversation completed successfully', { conversationId });
    } catch (error) {
      logger.error('Error completing conversation', { error, conversationId, userId });
      throw error;
    }
  }

  /**
   * Get example text for a field based on its name and type
   * @private
   */
  private getExampleForField(fieldName: string, fieldType: string): string {
    const lowerFieldName = fieldName.toLowerCase();

    // Provide contextual examples based on field name patterns
    if (lowerFieldName.includes('name') || lowerFieldName.includes('party')) {
      if (lowerFieldName.includes('company') || lowerFieldName.includes('organization')) {
        return '_Examples: "Acme Corporation", "TechStart Inc.", "Global Solutions Ltd"_';
      }
      return '_Examples: "John Smith", "Jane Doe", "Robert Johnson"_';
    }

    if (lowerFieldName.includes('date') || lowerFieldName.includes('effective')) {
      return '_Examples: "2025-01-15", "December 31, 2025", "01/15/2025"_';
    }

    if (lowerFieldName.includes('email')) {
      return '_Examples: "john.smith@company.com", "contact@acmecorp.com"_';
    }

    if (lowerFieldName.includes('phone') || lowerFieldName.includes('telephone')) {
      return '_Examples: "+1 (555) 123-4567", "555-1234"_';
    }

    if (lowerFieldName.includes('address')) {
      return '_Examples: "123 Main Street, New York, NY 10001", "456 Oak Avenue, Suite 200"_';
    }

    if (lowerFieldName.includes('amount') || lowerFieldName.includes('price') || lowerFieldName.includes('fee')) {
      return '_Examples: "$10,000", "5000 USD", "$2,500.00"_';
    }

    if (lowerFieldName.includes('percentage') || lowerFieldName.includes('rate')) {
      return '_Examples: "5%", "10.5%", "2.75%"_';
    }

    // Default based on field type
    if (fieldType === 'date') {
      return '_Examples: "2025-01-15", "December 31, 2025"_';
    }

    if (fieldType === 'number') {
      return '_Examples: "100", "1000", "5.5"_';
    }

    return '_Please provide the appropriate value for this field._';
  }
}
