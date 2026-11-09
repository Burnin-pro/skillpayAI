import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as negotiationController from '../controllers/negotiation.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(negotiationController.createNegotiationSchema), asyncHandler(negotiationController.createNegotiation));
router.post('/:id/messages', validate(negotiationController.messageSchema), asyncHandler(negotiationController.sendMessage));
router.post('/:id/mediate', asyncHandler(negotiationController.mediate));
router.post('/:id/accept', asyncHandler(negotiationController.acceptAgreement));

export default router;
