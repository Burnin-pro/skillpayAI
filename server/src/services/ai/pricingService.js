import { generateWithValidation } from './aiProvider.js';
import { priceRecommendationSchema } from './schemas.js';

export const recommendPrice = async (jobRequirement, userId) => {
  const baseBudget = (jobRequirement.budgetCents ? jobRequirement.budgetCents / 100 : jobRequirement.budget) || 100;

  const system = `You are the SkillPay AI Pricing Agent.
Analyze the job requirement and recommend a fair price, delivery days, and revisions.
The customer's base budget is $${baseBudget}.
Return strict JSON matching the schema.`;

  const userPrompt = `recommend a price for Job Requirement:\n${JSON.stringify(jobRequirement)}\nBase budget: $${baseBudget}`;

  let data;
  let usedFallback = false;

  try {
    const result = await generateWithValidation({
      system,
      user: userPrompt,
      schema: priceRecommendationSchema,
      userId
    });
    data = result.data;
    usedFallback = result.usedFallback;
  } catch {
    data = {
      recommendedPrice: Math.round(baseBudget * 0.85),
      reasons: [
        "4-day turnaround requires moderate delivery speed.",
        "Reflects typical market rates for responsive frontend and booking systems."
      ],
      deliveryDays: jobRequirement.deadlineDays || 4,
      revisions: 2
    };
    usedFallback = true;
  }

  let recPrice = data.recommendedPrice || Math.round(baseBudget * 0.85);

  // CLAMP the final value based on strict constraints (rounding to nearest 5)
  // Cannot be less than 50% of budget, or more than 150% of budget
  const minPrice = Math.round(baseBudget * 0.5);
  const maxPrice = Math.round(baseBudget * 1.5);

  if (recPrice < minPrice) recPrice = minPrice;
  if (recPrice > maxPrice) recPrice = maxPrice;

  recPrice = Math.round(recPrice / 5) * 5;

  return {
    ...data,
    recommendedPrice: recPrice, // USD
    range: [minPrice, maxPrice],
    usedFallback
  };
};
