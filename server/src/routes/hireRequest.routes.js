import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as hireController from '../controllers/hireRequest.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('customer'), asyncHandler(hireController.createHireRequest));
router.get('/', asyncHandler(hireController.getHireRequests));
router.get('/:id', asyncHandler(hireController.getHireRequestById));

router.post('/:id/accept', requireRole('provider'), asyncHandler(hireController.acceptHireRequest));
router.post('/:id/decline', requireRole('provider'), asyncHandler(hireController.declineHireRequest));
router.post('/:id/withdraw', requireRole('customer'), asyncHandler(hireController.withdrawHireRequest));

export default router;
