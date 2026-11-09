// DETERMINISTIC score exactly: skill*0.40 + budget*0.20 + deadline*0.15 + rating*0.10 + experience*0.10 + availability*0.05.

export function calculateMatchScore(provider, jobRequirement) {
  // 1. Skill Match (40%)
  const requiredSkills = jobRequirement.skills || [];
  const matchedSkillsCount = requiredSkills.filter(skill => 
    provider.skills.some(ps => ps.toLowerCase() === skill.toLowerCase())
  ).length;
  const skillScore = requiredSkills.length > 0 ? (matchedSkillsCount / requiredSkills.length) * 100 : 100;

  // 2. Budget (20%)
  // Estimate total cost based on hourly rate (assume 10 hours for small, 40 for medium, 100 for high complexity)
  const hours = jobRequirement.complexity === 'high' ? 80 : jobRequirement.complexity === 'medium' ? 40 : 10;
  const estimatedCost = provider.hourlyRate * hours;
  let budgetScore = 100;
  if (estimatedCost > jobRequirement.budget) {
    budgetScore = Math.max(0, 100 - ((estimatedCost - jobRequirement.budget) / jobRequirement.budget) * 100);
  }

  // 3. Deadline (15%)
  // Provider needs sufficient availability to meet the deadline
  const daysNeeded = hours / 8; // 8 hours a day
  const maxDaysPossible = jobRequirement.deadlineDays * provider.availability;
  let deadlineScore = 100;
  if (daysNeeded > maxDaysPossible) {
    deadlineScore = Math.max(0, 100 - ((daysNeeded - maxDaysPossible) / maxDaysPossible) * 100);
  }

  // 4. Rating (10%)
  const ratingScore = (provider.rating / 5) * 100;

  // 5. Experience (10%)
  const experienceScore = Math.min(100, provider.experienceYears * 10); // 10 years = 100

  // 6. Availability (5%)
  const availabilityScore = provider.availability * 100;

  const totalScore = (
    (skillScore * 0.40) +
    (budgetScore * 0.20) +
    (deadlineScore * 0.15) +
    (ratingScore * 0.10) +
    (experienceScore * 0.10) +
    (availabilityScore * 0.05)
  );

  return {
    score: Math.round(totalScore),
    breakdown: {
      skill: Math.round(skillScore),
      budget: Math.round(budgetScore),
      deadline: Math.round(deadlineScore),
      rating: Math.round(ratingScore),
      experience: Math.round(experienceScore),
      availability: Math.round(availabilityScore)
    }
  };
}
