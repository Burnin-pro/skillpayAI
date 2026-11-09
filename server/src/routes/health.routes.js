import { Router } from 'express';
import { env } from '../config/env.js';
import { db } from '../config/firebase.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    // Quick Firestore check
    await db.collection('health').limit(1).get();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      aiConfigured: !!env.AI_API_KEY && env.AI_PROVIDER !== 'fallback',
      paypalConfigured: !!env.PAYPAL_CLIENT_ID && !!env.PAYPAL_CLIENT_SECRET,
      payoutMode: env.PAYOUT_MODE,
      emulator: env.FIREBASE_EMULATOR === 'true'
    });
  } catch (error) {
    next(new AppError('Database connection failed', 503, ErrorCodes.INTERNAL_SERVER_ERROR));
  }
});

export default router;
