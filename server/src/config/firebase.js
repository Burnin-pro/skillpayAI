import admin from 'firebase-admin';
import { env } from './env.js';
import pino from 'pino';

const logger = pino();

let app;

try {
  if (env.FIREBASE_EMULATOR === 'true') {
    // Emulator mode: minimal config
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    app = admin.initializeApp({ projectId: env.FIREBASE_PROJECT_ID });
    logger.info('Firebase Admin initialized in EMULATOR mode.');
  } else {
    // Production mode
    if (!env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
      throw new Error('FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are required for non-emulator mode.');
    }
    
    // Clean up the private key by removing quotes and fixing escaped newlines
    let privateKey = env.FIREBASE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    logger.info('Firebase Admin initialized in LIVE mode.');
  }
} catch (error) {
  logger.fatal({ error }, 'Failed to initialize Firebase Admin');
  process.exit(1);
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
