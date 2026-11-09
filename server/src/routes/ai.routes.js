import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as aiController from '../controllers/ai.controller.js';
import * as aiProviderController from '../controllers/aiProvider.controller.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for AI routes to control costs
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: { error: 'Too many AI requests from this IP, please try again after 15 minutes' }
});

router.use(aiLimiter);

// AI Assistant Chatbot (Accessible to both guests and authenticated users)
router.post('/assistant', asyncHandler(aiController.chatAssistant));

// Authenticated AI routes
router.use(requireAuth);

router.post('/analyze-requirement', asyncHandler(aiController.analyzeRequirement));
router.post('/recommend-price', asyncHandler(aiController.recommendPrice));
router.post('/match-providers', asyncHandler(aiController.matchProviders));
router.post('/suggest-price', asyncHandler(aiProviderController.suggestPrice));
router.post('/improve-bio', asyncHandler(aiProviderController.improveBio));

export default router;

