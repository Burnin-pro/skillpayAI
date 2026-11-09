import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as orderController from '../controllers/order.controller.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many checkout attempts from this IP' }
});

router.use(requireAuth);

router.get('/', asyncHandler(orderController.getOrders));
router.get('/:internalOrderId', asyncHandler(orderController.getOrder));
router.post('/checkout', checkoutLimiter, asyncHandler(orderController.checkout));
router.post('/:internalOrderId/capture', checkoutLimiter, asyncHandler(orderController.capture));

export default router;
