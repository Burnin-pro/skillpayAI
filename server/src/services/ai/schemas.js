import { z } from 'zod';

export const requirementAnalysisSchema = z.object({
  category: z.string(),
  requiredSkills: z.array(z.string()),
  budgetCents: z.number().positive(),
  currency: z.string().default('USD'),
  deadlineDays: z.number().positive(),
  complexity: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(1),
  summary: z.string()
});

export const priceRecommendationSchema = z.object({
  recommendedPrice: z.number().positive(),
  reasons: z.array(z.string()),
  deliveryDays: z.number().positive(),
  revisions: z.number().nonnegative()
});

export const negotiationSchema = z.object({
  fairness: z.enum(['excellent', 'fair', 'poor']),
  rationale: z.string(),
  suggestedPrice: z.number().positive(),
  suggestedDeliveryDays: z.number().positive(),
  suggestedRevisions: z.number().nonnegative()
});

export const proposalSchema = z.object({
  proposalText: z.string(),
  scope: z.array(z.string())
});
