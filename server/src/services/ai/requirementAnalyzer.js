import { generateWithValidation } from './aiProvider.js';
import { requirementAnalysisSchema } from './schemas.js';
import crypto from 'crypto';
import { db } from '../../config/firebase.js';

export const analyzeRequirement = async (text, userId) => {
  // Normalize and hash for caching
  const normalizedText = text.trim().toLowerCase();
  const hash = crypto.createHash('sha256').update(normalizedText).digest('hex');
  
  // Check cache
  const cacheDoc = await db.collection('aiRequirementCache').doc(hash).get();
  if (cacheDoc.exists) {
    return { ...cacheDoc.data(), cached: true };
  }

  const system = `You are the SkillPay AI Requirement Analyzer. 
Your job is to extract actionable project parameters from natural language descriptions.
Estimate budget in CENTS (e.g. $100 = 10000 cents, $250 = 25000 cents). If budget is not explicitly stated in the description, estimate a fair realistic market budget in cents based on the complexity and scope.
Currency is always "USD".
Complexity must be "low", "medium", or "high".

You MUST return a JSON object with EXACTLY these field names:
{
  "category": string (e.g. "Web Development", "E-Commerce", "Mobile Development", "UI/UX Design"),
  "requiredSkills": string[] (relevant modern skills, e.g. ["React", "Shopify", "Mobile App", "Payment Gateway"]),
  "budgetCents": number (positive integer in cents),
  "currency": "USD",
  "deadlineDays": number (positive integer, e.g. 4, 7, 14),
  "complexity": "low" | "medium" | "high",
  "confidence": number (between 0.7 and 1.0),
  "summary": string (clean 1-sentence project title/summary)
}`;

  const userPrompt = `Project Description:\n${text}`;

  const result = await generateWithValidation({
    system,
    user: userPrompt,
    schema: requirementAnalysisSchema,
    userId
  });

  const finalData = { ...result.data, usedFallback: result.usedFallback, cached: false };

  // Save to cache (non-blocking)
  if (!result.usedFallback && result.data.confidence > 0.6) {
    db.collection('aiRequirementCache').doc(hash).set(finalData).catch(() => {});
  }

  return finalData;
};
