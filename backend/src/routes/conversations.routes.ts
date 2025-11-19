import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  startConversation,
  sendMessage,
  getConversationHistory,
  fillPlaceholder,
  completeConversation,
} from '../controllers/conversationController';

const router = Router();

/**
 * POST /api/conversations/start
 * Start a new conversation for a document (authenticated)
 */
router.post('/start', authenticate, startConversation);

/**
 * POST /api/conversations/:id/message
 * Send a message in a conversation (authenticated)
 */
router.post('/:id/message', authenticate, sendMessage);

/**
 * GET /api/conversations/:id/history
 * Get conversation history (authenticated)
 */
router.get('/:id/history', authenticate, getConversationHistory);

/**
 * POST /api/conversations/:id/fill-placeholder
 * Fill a placeholder value in a conversation (authenticated)
 */
router.post('/:id/fill-placeholder', authenticate, fillPlaceholder);

/**
 * POST /api/conversations/:id/complete
 * Complete a conversation (authenticated)
 */
router.post('/:id/complete', authenticate, completeConversation);

export default router;
