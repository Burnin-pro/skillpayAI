import { AppError, ErrorCodes } from '../utils/errors.js';

export const suggestPrice = async (req, res) => {
  const { skills = [], experienceYears = 3, level = 'intermediate', category = 'Web Development' } = req.body;

  let base = 50;
  if (experienceYears >= 5) base += 35;
  else if (experienceYears >= 3) base += 20;

  if (level === 'expert') base += 25;
  else if (level === 'intermediate') base += 10;

  if (skills.some(s => /react|solidity|smart contract|escrow|next\.js/i.test(s))) {
    base += 15;
  }

  const min = Math.round(base * 0.85);
  const max = Math.round(base * 1.35);

  const reasons = [
    `${level.charAt(0).toUpperCase() + level.slice(1)} level with ${experienceYears} years of verified experience.`,
    `High demand market rates for ${category} skill stack (${skills.slice(0, 3).join(', ') || 'Core Skills'}).`,
    `Recommended base project fee to maximize conversion while maintaining competitive margins.`
  ];

  res.json({
    suggestedPriceCents: base * 100,
    rangeCents: [min * 100, max * 100],
    suggestedPriceUSD: base,
    rangeUSD: [min, max],
    reasons,
    disclaimer: 'AI suggestion, not a guarantee'
  });
};

export const improveBio = async (req, res) => {
  const { currentBio = '', headline = '', skills = [], experienceYears = 3 } = req.body;

  const topSkills = skills.slice(0, 4).join(', ') || 'modern web technologies';

  const improvedBio = currentBio && currentBio.trim().length > 20
    ? `Results-driven software engineer and ${headline || 'technical specialist'} with ${experienceYears}+ years of hands-on experience building high-performance solutions with ${topSkills}. Committed to clear milestones, transparent communication, and 100% verified delivery via PayPal Smart Escrow.`
    : `Full-Stack Developer and technical consultant specializing in ${topSkills}. With ${experienceYears}+ years delivering clean code and responsive digital products, I help businesses turn complex requirements into robust, high-impact web applications backed by milestone-protected smart escrow.`;

  res.json({
    originalBio: currentBio,
    improvedBio,
    suggestions: [
      'Emphasize your technical edge and PayPal Smart Escrow reliability.',
      'Highlight concrete deliverables to boost client hire confidence.'
    ]
  });
};
