import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as providerController from '../controllers/provider.controller.js';

const router = Router();

// Public / discovery routes
router.get('/', asyncHandler(providerController.getProviders));

// Current provider profile actions (must precede /:id)
router.put('/me', requireAuth, requireRole('provider'), asyncHandler(providerController.updateMyProfile));
router.post('/me/publish', requireAuth, requireRole('provider'), asyncHandler(providerController.publishMyProfile));

// Single provider profile by ID
router.get('/:id', asyncHandler(providerController.getProviderById));

export default router;
