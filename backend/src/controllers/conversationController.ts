import { Request, Response } from 'express';
import { ConversationService } from '../services/ConversationService';
import { logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';

const conversationService = new ConversationService();

/**
 * Start a new conversation for a document
 * POST /api/conversations/start
 */
export const startConversation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { documentId } = req.body;

  if (!documentId) {
    throw createError('Document ID is required', 400, 'MISSING_DOCUMENT_ID');
  }

  const result = await conversationService.startConversation(documentId, req.user.id);

  logger.info('Conversation started', {
    userId: req.user.id,
    documentId,
    conversationId: result.conversation.id,
  });

  res.status(201).json({
    success: true,
    data: result,
  });
});

/**
 * Send a message in a conversation
 * POST /api/conversations/:id/message
 */
export const sendMessage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;
  const { message } = req.body;

  if (!id) {
    throw createError('Conversation ID is required', 400, 'MISSING_ID');
  }

  if (!message) {
    throw createError('Message is required', 400, 'MISSING_MESSAGE');
  }

  const response = await conversationService.sendMessage(id, req.user.id, message);

  logger.info('Message sent in conversation', {
    userId: req.user.id,
    conversationId: id,
    messageLength: message.length,
  });

  res.status(200).json({
    success: true,
    data: { response },
  });
});

/**
 * Get conversation history
 * GET /api/conversations/:id/history
 */
export const getConversationHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;

  if (!id) {
    throw createError('Conversation ID is required', 400, 'MISSING_ID');
  }

  try {
    const history = await conversationService.getConversationHistory(id, req.user.id);

    res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Conversation not found') {
      throw createError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }
    throw error;
  }
});

/**
 * Fill a placeholder value
 * POST /api/conversations/:id/fill-placeholder
 */
export const fillPlaceholder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;
  const { documentId, placeholderId, value } = req.body;

  if (!id) {
    throw createError('Conversation ID is required', 400, 'MISSING_ID');
  }

  if (!documentId) {
    throw createError('Document ID is required', 400, 'MISSING_DOCUMENT_ID');
  }

  if (!placeholderId) {
    throw createError('Placeholder ID is required', 400, 'MISSING_PLACEHOLDER_ID');
  }

  if (value === undefined || value === null) {
    throw createError('Value is required', 400, 'MISSING_VALUE');
  }

  await conversationService.fillPlaceholder(documentId, placeholderId, value, req.user.id);

  logger.info('Placeholder filled', {
    userId: req.user.id,
    conversationId: id,
    placeholderId,
  });

  res.status(200).json({
    success: true,
    data: { message: 'Placeholder filled successfully' },
  });
});

/**
 * Complete a conversation
 * POST /api/conversations/:id/complete
 */
export const completeConversation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw createError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;

  if (!id) {
    throw createError('Conversation ID is required', 400, 'MISSING_ID');
  }

  try {
    await conversationService.completeConversation(id, req.user.id);

    logger.info('Conversation completed', {
      userId: req.user.id,
      conversationId: id,
    });

    res.status(200).json({
      success: true,
      data: { message: 'Conversation completed successfully' },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Conversation not found') {
      throw createError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }
    throw error;
  }
});
