/**
 * Helper to check profile completeness & verification
 * Evaluates whether a freelancer has filled all essential details:
 * 1. Full name
 * 2. Professional headline
 * 3. At least 1 verified skill
 * 4. Base project price / hourly rate
 * 5. PayPal Sandbox email (for Smart Escrow payouts)
 * 6. Bio / description
 */
export function checkFreelancerVerification(profile, user = null) {
  const missing = [];
  
  const name = (profile?.name || user?.name || user?.displayName || '').trim();
  if (!name) missing.push({ key: 'name', label: 'Full Name' });

  const headline = (profile?.headline || '').trim();
  if (!headline) missing.push({ key: 'headline', label: 'Professional Headline' });

  const rawSkills = profile?.skillNames || profile?.skills || [];
  const skills = Array.isArray(rawSkills) ? rawSkills : [];
  if (skills.length === 0) missing.push({ key: 'skills', label: 'Skills (at least 1)' });

  const basePrice = profile?.projectRate || (profile?.projectRateCents ? profile.projectRateCents / 100 : null) || profile?.basePriceCents || profile?.hourlyRate;
  if (!basePrice || Number(basePrice) <= 0) missing.push({ key: 'rates', label: 'Base Project Rate' });

  const paypalEmail = (profile?.paypalEmail || user?.paypalEmail || user?.email || '').trim();
  if (!paypalEmail || !paypalEmail.includes('@')) missing.push({ key: 'paypalEmail', label: 'PayPal Sandbox Email' });

  const bio = (profile?.bio || '').trim();
  if (!bio || bio.length < 15) missing.push({ key: 'bio', label: 'About & Bio Details' });

  const isVerified = missing.length === 0;
  const completenessPercent = Math.max(10, Math.round(((6 - missing.length) / 6) * 100));

  return {
    isVerified,
    completenessPercent,
    missingItems: missing
  };
}

