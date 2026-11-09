import { z } from 'zod';
import dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID is required"),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_EMULATOR: z.enum(['true', 'false']).default('false'),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_ENV: z.enum(['sandbox', 'live']).default('sandbox'),
  PAYPAL_WEBHOOK_ID: z.string().optional(),
  PAYOUT_MODE: z.enum(['simulated', 'live']).default('simulated'),
  PLATFORM_FEE_PERCENT: z.string().transform(val => parseFloat(val) || 10).default('10'),
  AI_PROVIDER: z.enum(['gemini', 'fallback']).default('gemini'),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default('gemini-1.5-flash')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const logger = pino();
  logger.fatal({ errors: parsed.error.format() }, 'Environment validation failed. Please check your .env file.');
  process.exit(1);
}

export const env = parsed.data;
