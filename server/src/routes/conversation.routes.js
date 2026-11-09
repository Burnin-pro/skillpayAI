import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as convController from '../controllers/conversation.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(convController.getConversations));
router.post('/', asyncHandler(convController.createConversation));
router.get('/:id/messages', asyncHandler(convController.getMessages));
router.post('/:id/messages', asyncHandler(convController.sendMessage));
router.delete('/:id', asyncHandler(convController.deleteConversation));

export default router;
