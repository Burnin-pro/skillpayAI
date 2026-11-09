import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', asyncHandler(adminController.getDashboardData));

export default router;
