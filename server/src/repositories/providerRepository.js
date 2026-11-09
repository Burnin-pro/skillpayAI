import { db } from '../config/firebase.js';

const USERS = 'users';

export const computeProfileCompleteness = (profile = {}) => {
  let score = 0;
  if (profile.headline && profile.headline.trim().length >= 8) score += 15;
  if (profile.skillNames && profile.skillNames.length >= 1) score += 20;
  if (profile.bio && profile.bio.trim().length >= 50) score += 20;
  if ((profile.basePriceCents && profile.basePriceCents > 0) || (profile.projectRateCents && profile.projectRateCents > 0)) score += 15;
  if (profile.availability && ['available', 'busy', 'away'].includes(profile.availability)) score += 10;
  if (profile.portfolio && profile.portfolio.length >= 1) score += 10;
  if (profile.paypalEmail && profile.paypalEmail.includes('@')) score += 10;
  return Math.min(100, score);
};

export const getProviderById = async (id) => {
  const doc = await db.collection(USERS).doc(id).get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data();
  if (data.role !== 'provider') return null;
  return { id: doc.id, ...data };
};

export const updateProvider = async (uid, data) => {
  const existing = await getProviderById(uid);
  const merged = { ...(existing || {}), ...data };
  const completeness = computeProfileCompleteness(merged);
  const now = new Date().toISOString();

  const toSave = {
    ...data,
    profileCompleteness: completeness,
    updatedAt: now
  };

  await db.collection(USERS).doc(uid).set(toSave, { merge: true });
  return await getProviderById(uid);
};

export const publishProvider = async (uid, shouldPublish = true) => {
  const provider = await getProviderById(uid);
  if (!provider) {
    throw new Error('Provider not found');
  }

  if (shouldPublish) {
    // Validate publishing constraints
    const hasHeadline = provider.headline && provider.headline.trim().length > 0;
    const hasSkills = provider.skillNames && provider.skillNames.length >= 1;
    const hasBasePrice = (provider.basePriceCents && provider.basePriceCents > 0) || (provider.projectRateCents && provider.projectRateCents > 0);
    const hasBio = provider.bio && provider.bio.trim().length >= 50;
    const hasAvailability = Boolean(provider.availability);

    if (!hasHeadline || !hasSkills || !hasBasePrice || !hasBio || !hasAvailability) {
      throw new Error('Profile does not meet publishing requirements (headline, >=1 skill, base price, bio >=50 chars, availability)');
    }
  }

  const now = new Date().toISOString();
  await db.collection(USERS).doc(uid).set({
    published: shouldPublish,
    updatedAt: now
  }, { merge: true });

  return await getProviderById(uid);
};

export const DEMO_PROVIDERS = [
  {
    id: 'provider_muthu',
    name: 'Muthupandi',
    email: 'demo-provider@skillpay.demo',
    role: 'provider',
    headline: 'Senior Full-Stack & Fintech React Developer',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    rating: 4.9,
    ratingCount: 42,
    experienceYears: 6,
    basePriceCents: 8500,
    projectRateCents: 8500,
    hourlyRateCents: 5000,
    hourlyRate: 50,
    deliveryDaysTypical: 3,
    revisionsIncluded: 2,
    availability: 'available',
    published: true,
    profileCompleteness: 100,
    onboardingStep: 6,
    languages: ['English', 'Tamil'],
    timezone: 'UTC+05:30',
    responseTimeHours: 1,
    weeklyCapacity: '30 hrs/week',
    skillNames: ['React', 'JavaScript', 'Node.js', 'HTML', 'CSS', 'TailwindCSS', 'Web Development'],
    skills: ['React', 'JavaScript', 'Node.js', 'HTML', 'CSS', 'TailwindCSS', 'Web Development'],
    packages: [
      {
        tier: 'basic',
        title: 'Single Page / Landing Section',
        description: 'Responsive single page with interactive components and clean semantics.',
        priceCents: 8500,
        deliveryDays: 2
      },
      {
        tier: 'standard',
        title: 'Full Restaurant Website & Menu',
        description: 'Multi-section restaurant site with digital menu, contact form, and table reservation booking.',
        priceCents: 12500,
        deliveryDays: 4
      },
      {
        tier: 'premium',
        title: 'Full-Stack Custom Web App',
        description: 'Complete web application with dynamic database integration, authentication, and payment workflows.',
        priceCents: 24000,
        deliveryDays: 7
      }
    ],
    portfolio: [
      { title: 'Bistro Modern Restaurant Website', url: 'https://github.com/example/bistro-react' },
      { title: 'Fintech Escrow Dashboard', url: 'https://github.com/example/escrow-vault' }
    ],
    paypalEmail: 'demo-provider@skillpay.demo',
    completedOrders: 42,
    completedProjects: 42,
    isDemo: true,
    bio: 'Senior Full-Stack Developer with 6+ years of experience building modern React web apps, high-conversion landing pages, and verified escrow fintech tools.',
    rationale: '94% Match: Strong proficiency in React, responsive menus, and fast 4-day turnaround.',
    score: 94,
    breakdown: { skill: 40, budget: 20, deadline: 15, rating: 10, experience: 5, availability: 4 }
  },
  {
    id: 'provider_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah@skillpay.demo',
    role: 'provider',
    headline: 'Product Designer & Frontend UI Specialist',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    rating: 4.8,
    ratingCount: 28,
    experienceYears: 4,
    basePriceCents: 9500,
    projectRateCents: 9500,
    hourlyRateCents: 4500,
    hourlyRate: 45,
    deliveryDaysTypical: 4,
    revisionsIncluded: 3,
    availability: 'available',
    published: true,
    profileCompleteness: 95,
    onboardingStep: 6,
    languages: ['English'],
    timezone: 'UTC-05:00',
    responseTimeHours: 2,
    weeklyCapacity: '25 hrs/week',
    skillNames: ['Figma', 'UI/UX Design', 'HTML', 'CSS', 'Web Design'],
    skills: ['Figma', 'UI/UX Design', 'HTML', 'CSS', 'Web Design'],
    packages: [
      {
        tier: 'basic',
        title: 'Design Audit & Wireframe',
        description: 'Comprehensive UI audit and structured wireframes for your web project.',
        priceCents: 9500,
        deliveryDays: 3
      }
    ],
    portfolio: [
      { title: 'Culinary Brand & Mobile Ordering UI', url: 'https://figma.com/@sarah-design' }
    ],
    paypalEmail: 'sarah@skillpay.demo',
    completedOrders: 28,
    completedProjects: 28,
    isDemo: true,
    bio: 'Product Designer & Frontend Developer with experience creating modern restaurant branding, booking flows, and accessible web experiences.',
    rationale: '89% Match: Outstanding visual design credentials with verified client recommendations.',
    score: 89,
    breakdown: { skill: 35, budget: 20, deadline: 15, rating: 10, experience: 4, availability: 5 }
  },
  {
    id: 'provider_elena',
    name: 'Elena Rostova',
    email: 'elena@skillpay.demo',
    role: 'provider',
    headline: 'Senior Full-Stack & Cloud Engineer',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    rating: 4.95,
    ratingCount: 89,
    experienceYears: 8,
    basePriceCents: 15000,
    projectRateCents: 15000,
    hourlyRateCents: 6500,
    hourlyRate: 65,
    deliveryDaysTypical: 5,
    revisionsIncluded: 2,
    availability: 'busy',
    published: false, // Partial profile demo
    profileCompleteness: 65,
    onboardingStep: 3,
    skillNames: ['React', 'Node.js', 'Web Development', 'TypeScript', 'Next.js'],
    skills: ['React', 'Node.js', 'Web Development', 'TypeScript', 'Next.js'],
    completedOrders: 89,
    completedProjects: 89,
    isDemo: true,
    bio: 'Lead Full-Stack Engineer with 8+ years building enterprise grade web apps and payment portals.',
    rationale: '92% Match: Top-rated senior engineer with 100% on-time project completion.',
    score: 92,
    breakdown: { skill: 40, budget: 15, deadline: 15, rating: 10, experience: 8, availability: 4 }
  },
  {
    id: 'provider_alex',
    name: 'Alex Chen',
    email: 'alex@skillpay.demo',
    role: 'provider',
    headline: 'Frontend Developer & WordPress Builder',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    rating: 4.6,
    ratingCount: 19,
    experienceYears: 3,
    basePriceCents: 6000,
    projectRateCents: 6000,
    hourlyRateCents: 3000,
    hourlyRate: 30,
    deliveryDaysTypical: 3,
    revisionsIncluded: 1,
    availability: 'away',
    published: false, // Incomplete demo
    profileCompleteness: 40,
    onboardingStep: 2,
    skillNames: ['HTML', 'CSS', 'JavaScript', 'WordPress', 'Web Development'],
    skills: ['HTML', 'CSS', 'JavaScript', 'WordPress', 'Web Development'],
    completedOrders: 19,
    completedProjects: 19,
    isDemo: true,
    bio: 'Frontend developer focused on high-speed delivery of landing pages and restaurant menus.',
    rationale: '86% Match: Budget-friendly provider ideal for 4-day delivery constraints.',
    score: 86,
    breakdown: { skill: 35, budget: 20, deadline: 15, rating: 8, experience: 4, availability: 4 }
  }
];

export const searchProviders = async (filters = {}) => {
  let query = db.collection(USERS).where('role', '==', 'provider');
  
  if (filters.published !== undefined) {
    query = query.where('published', '==', filters.published);
  }
  
  if (filters.isDemo !== undefined) {
    query = query.where('isDemo', '==', filters.isDemo);
  }
  
  const snapshot = await query.get().catch(() => ({ docs: [] }));
  let providers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Filter published only by default if requested
  if (filters.publishedOnly) {
    providers = providers.filter(p => p.published === true);
  }
  
  if (filters.skills && filters.skills.length > 0) {
    providers = providers.filter(p => 
      p.skillNames && filters.skills.some(skill => p.skillNames.map(s => s.toLowerCase()).includes(skill.toLowerCase()))
    );
  }

  if (filters.minPrice) {
    const minCents = Number(filters.minPrice) * 100;
    providers = providers.filter(p => (p.basePriceCents || p.projectRateCents || 0) >= minCents);
  }

  if (filters.maxPrice) {
    const maxCents = Number(filters.maxPrice) * 100;
    providers = providers.filter(p => (p.basePriceCents || p.projectRateCents || 0) <= maxCents);
  }

  if (filters.availability) {
    providers = providers.filter(p => p.availability === filters.availability);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    providers = providers.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.headline && p.headline.toLowerCase().includes(q)) ||
      (p.bio && p.bio.toLowerCase().includes(q)) ||
      (p.skillNames && p.skillNames.some(s => s.toLowerCase().includes(q)))
    );
  }
  
  return providers;
};
