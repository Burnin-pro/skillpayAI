export const generateJSON = async ({ system, user, schema }) => {
  const text = (user || '').toLowerCase();
  
  // Extract explicit budget if present in user prompt (e.g. $250, $150, etc.)
  const budgetMatch = text.match(/\$(\d+)/) || text.match(/(\d+)\s*(?:dollars|usd|bucks)/);
  const parsedBudget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;

  // 1. Requirement Analysis Fallback
  if (text.includes('project description') || text.includes('requirement analyzer') || (system && system.includes('Requirement Analyzer'))) {
    if (text.includes('shop') || text.includes('store') || text.includes('product') || text.includes('sell') || text.includes('ecommerce')) {
      const budget = parsedBudget || 250;
      return {
        category: 'E-Commerce & Retail',
        requiredSkills: ['E-Commerce', 'React', 'Shopify', 'Payment Integration', 'Mobile App'],
        budgetCents: budget * 100,
        currency: 'USD',
        deadlineDays: 7,
        complexity: 'medium',
        confidence: 0.92,
        summary: 'Responsive online shop website & product sales application'
      };
    }

    if (text.includes('mobile') || text.includes('app') || text.includes('ios') || text.includes('android')) {
      const budget = parsedBudget || 300;
      return {
        category: 'Mobile App Development',
        requiredSkills: ['React Native', 'Flutter', 'Mobile App', 'Node.js', 'REST API'],
        budgetCents: budget * 100,
        currency: 'USD',
        deadlineDays: 10,
        complexity: 'medium',
        confidence: 0.9,
        summary: 'Cross-platform mobile application and backend services'
      };
    }

    if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('figma')) {
      const budget = parsedBudget || 150;
      return {
        category: 'UI/UX Design',
        requiredSkills: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping'],
        budgetCents: budget * 100,
        currency: 'USD',
        deadlineDays: 5,
        complexity: 'low',
        confidence: 0.94,
        summary: 'UI/UX design system & high-fidelity prototype'
      };
    }

    if (text.includes('restaurant') || text.includes('menu') || text.includes('booking')) {
      const budget = parsedBudget || 100;
      return {
        category: 'Web Development',
        requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Booking UI'],
        budgetCents: budget * 100,
        currency: 'USD',
        deadlineDays: 4,
        complexity: 'medium',
        confidence: 0.95,
        summary: 'Restaurant website with menu, contact, and booking system'
      };
    }

    // Default general web project with dynamic parsed budget
    const defaultBudget = parsedBudget || 180;
    return {
      category: 'Web Development',
      requiredSkills: ['React', 'JavaScript', 'TailwindCSS', 'Web Development'],
      budgetCents: defaultBudget * 100,
      currency: 'USD',
      deadlineDays: 6,
      complexity: 'medium',
      confidence: 0.88,
      summary: 'Responsive custom web application'
    };
  }

  // 2. Pricing Recommendation Fallback
  if (text.includes('recommend a price') || text.includes('pricing') || (system && system.includes('Pricing Agent'))) {
    // Extract base budget from prompt
    const baseBudgetMatch = text.match(/base budget:\s*\$?(\d+)/i) || text.match(/"budget":\s*(\d+)/i) || text.match(/"budgetCents":\s*(\d+)/i);
    let baseBudget = 100;
    if (baseBudgetMatch) {
      const val = parseInt(baseBudgetMatch[1], 10);
      baseBudget = val > 1000 ? Math.round(val / 100) : val;
    }
    const recommendedPrice = Math.round((baseBudget * 0.85) / 5) * 5;

    return {
      recommendedPrice: recommendedPrice,
      reasons: [
        `Market pricing benchmark calculated at ~85% of target budget ($${baseBudget}).`,
        "Accounts for complexity, turnaround speed, and verified developer availability."
      ],
      deliveryDays: 4,
      revisions: 2
    };
  }

  // 3. AI Mediation Fallback
  if (text.includes('mediate') || (system && system.includes('Mediator'))) {
    // Extract current customer offer and provider ask from prompt
    const custMatch = text.match(/current customer offer:\s*\$?(\d+)/i);
    const provMatch = text.match(/current provider ask:\s*\$?(\d+)/i);
    const cust = custMatch ? parseInt(custMatch[1], 10) : 70;
    const prov = provMatch ? parseInt(provMatch[1], 10) : 100;
    const compromise = Math.round(((cust + prov) / 2) / 5) * 5;

    return {
      fairness: 'fair',
      rationale: `Market analysis indicates meeting in the middle around $${compromise} represents a fair win-win for both parties.`,
      suggestedPrice: compromise,
      suggestedDeliveryDays: 3,
      suggestedRevisions: 2
    };
  }

  // Default fallback
  return {
    category: 'General',
    requiredSkills: ['Problem Solving', 'Communication'],
    budgetCents: 10000,
    currency: 'USD',
    deadlineDays: 5,
    complexity: 'medium',
    confidence: 0.8,
    summary: 'Standard project scope'
  };
};
