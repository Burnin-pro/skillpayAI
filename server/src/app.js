import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';

import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import providersRoutes from './routes/providers.routes.js';
import aiRoutes from './routes/ai.routes.js';
import negotiationRoutes from './routes/negotiation.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import webhooksRoutes from './routes/webhooks.routes.js';
import adminRoutes from './routes/admin.routes.js';
import hireRequestRoutes from './routes/hireRequest.routes.js';
import conversationRoutes from './routes/conversation.routes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, curl, paypal webhooks)
    if (!origin) return callback(null, true);
    // Allow configured CLIENT_ORIGIN, local hosts, and Vercel/Netlify preview deployments
    if (
      origin === env.CLIENT_ORIGIN ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.netlify.app')
    ) {
      return callback(null, true);
    }
    // Fallback: allow request in production so hosted clients are never blocked
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Body parsing with size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
app.use(pinoHttp({
  redact: ['req.headers.authorization'],
  autoLogging: env.NODE_ENV !== 'test'
}));

// Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/providers', providersRoutes);
app.use('/api/v1/hire-requests', hireRequestRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/negotiations', negotiationRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/webhooks', webhooksRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Global error handler
app.use(errorHandler);

export default app;
