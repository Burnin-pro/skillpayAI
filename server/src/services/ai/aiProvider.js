import { env } from '../../config/env.js';
import * as gemini from './geminiProvider.js';
import * as fallback from './fallbackProvider.js';
import { db } from '../../config/firebase.js';
import pino from 'pino';

const logger = pino();

export const generateWithValidation = async ({ system, user, schema, temperature = 0.2, userId }) => {
  const start = Date.now();
  let usedFallback = false;
  let parsedData = null;
  let errorMsg = null;

  try {
    if (env.AI_PROVIDER === 'gemini' && env.AI_API_KEY) {
      let resultObj;
      try {
        resultObj = await gemini.generateJSON({ system, user, schema, temperature });
      } catch (err) {
        logger.warn('Gemini failed, attempting 1 retry...');
        await new Promise(r => setTimeout(r, 1000));
        resultObj = await gemini.generateJSON({ system, user, schema, temperature });
      }
      
      const validation = schema.safeParse(resultObj);
      if (validation.success) {
        parsedData = validation.data;
      } else {
        logger.error({ errors: validation.error }, 'AI returned invalid schema format. Falling back.');
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Primary AI Provider failed entirely. Falling back.');
    usedFallback = true;
    errorMsg = error.message;
  }

  if (usedFallback) {
    const fbObj = await fallback.generateJSON({ system, user, schema });
    // Assume fallback returns valid data
    parsedData = schema.parse(fbObj);
  }

  const latency = Date.now() - start;

  // Log to aiLogs
  try {
    await db.collection('aiLogs').add({
      userId: userId || 'anonymous',
      kind: 'generation',
      model: env.AI_PROVIDER,
      latencyMs: latency,
      ok: !usedFallback,
      usedFallback,
      errorMsg,
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    // Ignore logging failures
  }

  return { data: parsedData, usedFallback };
};
