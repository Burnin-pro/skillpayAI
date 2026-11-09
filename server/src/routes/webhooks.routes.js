import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as webhookController from '../controllers/webhook.controller.js';

const router = Router();

// Notice: No requireAuth here. Webhooks are called by PayPal servers.
router.post('/paypal', asyncHandler(webhookController.handlePayPalWebhook));

export default router;
