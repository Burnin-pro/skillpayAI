import { auth, db } from '../config/firebase.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import pino from 'pino';

const logger = pino();

export const requireAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authenticated', 401, ErrorCodes.UNAUTHORIZED));
  }

  try {
    // Verify cryptographic signature locally (<1ms) instead of forcing remote roundtrip check on every call
    const decodedToken = await auth.verifyIdToken(token, false);

    // Fetch user profile from Firestore
    let userDoc = await db.collection('users').doc(decodedToken.uid).get();
    let profile = {};
    let role = null;

    if (userDoc.exists) {
      profile = userDoc.data();
      role = profile.role;
    } else if (decodedToken.email) {
      // Look up by email (e.g. seeded provider or previously created profile)
      const userByEmail = await db.collection('users').where('email', '==', decodedToken.email.toLowerCase().trim()).limit(1).get();
      if (!userByEmail.empty) {
        userDoc = userByEmail.docs[0];
        profile = userDoc.data();
        role = profile.role;
        // Sync to decodedToken.uid for fast subsequent lookups
        await db.collection('users').doc(decodedToken.uid).set(profile, { merge: true });
      }
    }

    if (!role) {
      if (decodedToken.email?.toLowerCase().includes('provider')) {
        role = 'provider';
      } else {
        role = decodedToken.role || 'customer';
      }
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: role,
      profile: profile
    };

    next();
  } catch (error) {
    logger.warn({ error: error.message }, 'Auth failed');
    return next(new AppError('Invalid or expired token', 401, ErrorCodes.UNAUTHORIZED));
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Role not authorized for this action', 403, ErrorCodes.FORBIDDEN));
    }
    next();
  };
};

