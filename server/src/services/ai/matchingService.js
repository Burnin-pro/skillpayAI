export const calculateMatchScore = (provider, jobRequirement) => {
  let score = 0;
  const breakdown = {
    skill: 0,
    budget: 0,
    deadline: 0,
    rating: 0,
    experience: 0,
    availability: 0
  };

  // Skill alignment (Max 40)
  if (jobRequirement.requiredSkills && jobRequirement.requiredSkills.length > 0) {
    const matchedSkills = jobRequirement.requiredSkills.filter(skill => 
      provider.skillNames && provider.skillNames.map(s => s.toLowerCase()).includes(skill.toLowerCase())
    );
    const skillRatio = matchedSkills.length / jobRequirement.requiredSkills.length;
    breakdown.skill = Math.round(skillRatio * 40);
  } else {
    breakdown.skill = 40; // If no skills required, full points
  }

  // Budget alignment (Max 20)
  if (provider.projectRateCents && provider.projectRateCents <= jobRequirement.budgetCents) {
    breakdown.budget = 20;
  } else if (provider.projectRateCents && provider.projectRateCents <= jobRequirement.budgetCents * 1.5) {
    breakdown.budget = 10;
  }

  // Deadline alignment (Max 15)
  // Simplified logic
  breakdown.deadline = 15; 

  // Rating (Max 10)
  if (provider.rating) {
    breakdown.rating = Math.round((provider.rating / 5) * 10);
  }

  // Experience (Max 10)
  if (provider.experienceYears) {
    breakdown.experience = Math.min(10, Math.round((provider.experienceYears / 5) * 10));
  }

  // Availability (Max 5)
  if (provider.availability === 'available') {
    breakdown.availability = 5;
  }

  score = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return { score, breakdown };
};
