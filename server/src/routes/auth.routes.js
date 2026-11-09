import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

// POST /api/v1/auth/profile
router.post('/profile', requireAuth, validate(authController.profileSchema), asyncHandler(authController.createProfile));

// GET /api/v1/auth/me
router.get('/me', requireAuth, asyncHandler(authController.getMe));

// PUT /api/v1/auth/me
router.put('/me', requireAuth, validate(authController.updateProfileSchema), asyncHandler(authController.updateMe));

export default router;
