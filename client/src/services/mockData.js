export const DEMO_USER = {
  id: 'u1',
  name: 'Demo Customer',
  role: 'customer',
  email: 'customer@skillpay.demo',
};

export const DEMO_ADMIN = {
  id: 'a1',
  name: 'Admin',
  role: 'admin',
  email: 'admin@skillpay.demo',
};

export const MOCK_PROVIDERS = [
  {
    id: 'provider_muthu',
    name: 'Muthupandi',
    role: 'provider',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    headline: 'Full-stack Web Developer & Fintech Specialist',
    bio: 'Senior full-stack engineer with 6+ years of verified expertise building high-performance web applications, interactive restaurant portals, and secure PayPal Smart Escrow integrations. Committed to clear communication and milestone excellence.',
    rating: 4.9,
    experienceYears: 6,
    basePriceCents: 8500, // $85 starting price
    hourlyRateCents: 3500,
    hourlyRate: 35,
    projectRateCents: 8500,
    deliveryDaysTypical: 3,
    revisionsIncluded: 2,
    location: 'San Jose, CA',
    timezone: 'America/Los_Angeles (PST)',
    languages: ['English', 'Tamil'],
    responseTimeHours: 1,
    weeklyCapacity: '35 hrs/week',
    availability: 'available',
    published: true,
    profileCompleteness: 100,
    paypalEmail: 'muthu-provider@skillpay.demo',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Web Development', 'TailwindCSS', 'PayPal Escrow API'],
    skillNames: ['HTML', 'CSS', 'JavaScript', 'React', 'Web Development', 'TailwindCSS', 'PayPal Escrow API'],
    skillDetails: [
      { name: 'React', level: 'expert', years: 6 },
      { name: 'JavaScript', level: 'expert', years: 6 },
      { name: 'TailwindCSS', level: 'expert', years: 4 },
      { name: 'PayPal Escrow API', level: 'expert', years: 3 },
      { name: 'Web Development', level: 'expert', years: 6 }
    ],
    packages: [
      {
        tier: 'basic',
        title: 'Single Page Landing & Menu',
        description: 'Clean responsive single-page site with interactive menu and mobile optimization.',
        priceCents: 5000, // $50
        deliveryDays: 2,
        revisions: 1
      },
      {
        tier: 'standard',
        title: 'Full Restaurant Website & Menu',
        description: 'Complete multi-section restaurant site, menu filter, reservation booking section, and contact form.',
        priceCents: 8500, // $85
        deliveryDays: 3,
        revisions: 2
      },
      {
        tier: 'premium',
        title: 'Full System + PayPal Escrow Integration',
        description: 'Full custom frontend, online orders, table booking engine, analytics and PayPal sandbox integration.',
        priceCents: 15000, // $150
        deliveryDays: 5,
        revisions: 3
      }
    ],
    portfolio: [
      {
        title: 'Bella Italia Restaurant & Table Booking',
        url: 'https://bella-italia-demo.skillpay.app',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop'
      },
      {
        title: 'Smart Escrow Vault Dashboard',
        url: 'https://vault.skillpay.app',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop'
      }
    ],
    certifications: ['Certified PayPal Integrator', 'React Certified Architect'],
    completedProjects: 42,
    completedOrders: 42,
    score: 94,
    breakdown: { skill: 40, budget: 20, deadline: 15, rating: 10, experience: 5, availability: 4 },
    rationale: '94% Match: Strong proficiency in React, responsive menus, and fast 4-day turnaround.'
  },
  {
    id: 'provider_sarah',
    name: 'Sarah Jenkins',
    role: 'provider',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    headline: 'Senior UI/UX Designer & Product Strategist',
    bio: 'Product designer focusing on user-centered fintech experiences, modern component systems, and converted brand identities.',
    rating: 4.8,
    experienceYears: 4,
    basePriceCents: 9000,
    hourlyRateCents: 4000,
    hourlyRate: 40,
    projectRateCents: 9000,
    deliveryDaysTypical: 4,
    revisionsIncluded: 3,
    location: 'Austin, TX',
    timezone: 'America/Chicago (CST)',
    languages: ['English', 'Spanish'],
    responseTimeHours: 2,
    weeklyCapacity: '25 hrs/week',
    availability: 'available',
    published: true,
    profileCompleteness: 90,
    paypalEmail: 'sarah-provider@skillpay.demo',
    skills: ['Figma', 'UI/UX Design', 'HTML', 'CSS', 'Web Design'],
    skillNames: ['Figma', 'UI/UX Design', 'HTML', 'CSS', 'Web Design'],
    skillDetails: [
      { name: 'Figma', level: 'expert', years: 4 },
      { name: 'UI/UX Design', level: 'expert', years: 4 }
    ],
    packages: [
      {
        tier: 'standard',
        title: 'Full Product Design System',
        description: 'Complete Figma design system with wireframes, prototypes, and developer export.',
        priceCents: 9000,
        deliveryDays: 4,
        revisions: 3
      }
    ],
    portfolio: [
      {
        title: 'CryptoVault Wallet UI',
        url: 'https://figma.com/@sarah/wallet',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=300&fit=crop'
      }
    ],
    certifications: ['NN/g UX Certified'],
    completedProjects: 28,
    completedOrders: 28,
    score: 89,
    breakdown: { skill: 35, budget: 20, deadline: 15, rating: 10, experience: 4, availability: 5 },
    rationale: '89% Match: Outstanding visual design credentials with verified client recommendations.'
  },
  {
    id: 'provider_elena',
    name: 'Elena Rostova',
    role: 'provider',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    headline: 'Senior Cloud Architect & Full-Stack Engineer',
    bio: '8+ years architecting scalable cloud solutions, TypeScript microservices, and high-load web applications.',
    rating: 4.95,
    experienceYears: 8,
    basePriceCents: 12000,
    hourlyRateCents: 5000,
    hourlyRate: 50,
    projectRateCents: 12000,
    deliveryDaysTypical: 5,
    revisionsIncluded: 2,
    location: 'Seattle, WA',
    timezone: 'America/Los_Angeles (PST)',
    languages: ['English', 'German'],
    responseTimeHours: 3,
    weeklyCapacity: '40 hrs/week',
    availability: 'busy',
    published: true,
    profileCompleteness: 95,
    paypalEmail: 'elena-provider@skillpay.demo',
    skills: ['React', 'Node.js', 'Web Development', 'TypeScript', 'Next.js'],
    skillNames: ['React', 'Node.js', 'Web Development', 'TypeScript', 'Next.js'],
    skillDetails: [
      { name: 'React', level: 'expert', years: 8 },
      { name: 'TypeScript', level: 'expert', years: 6 }
    ],
    packages: [
      {
        tier: 'standard',
        title: 'Full Stack Enterprise App',
        description: 'Scalable Next.js and Node.js architecture with database and API integration.',
        priceCents: 12000,
        deliveryDays: 5,
        revisions: 2
      }
    ],
    portfolio: [],
    certifications: ['AWS Certified Solutions Architect'],
    completedProjects: 89,
    completedOrders: 89,
    score: 92,
    breakdown: { skill: 40, budget: 15, deadline: 15, rating: 10, experience: 8, availability: 4 },
    rationale: '92% Match: Top-rated senior engineer with 100% on-time project completion.'
  },
  {
    id: 'provider_alex',
    name: 'Alex Chen',
    role: 'provider',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    headline: 'Junior Web Developer (Draft Profile)',
    bio: 'Junior developer building websites with HTML, CSS, JavaScript, and WordPress.',
    rating: 4.6,
    experienceYears: 3,
    basePriceCents: 2500,
    hourlyRateCents: 2500,
    hourlyRate: 25,
    projectRateCents: 2500,
    deliveryDaysTypical: 4,
    revisionsIncluded: 1,
    location: 'Toronto, Canada',
    timezone: 'America/Toronto (EST)',
    languages: ['English'],
    responseTimeHours: 12,
    weeklyCapacity: '15 hrs/week',
    availability: 'available',
    published: false, // UNPUBLISHED - Draft! Must NOT appear in client directory or AI matches!
    profileCompleteness: 55,
    paypalEmail: 'alex-provider@skillpay.demo',
    skills: ['HTML', 'CSS', 'JavaScript', 'WordPress', 'Web Development'],
    skillNames: ['HTML', 'CSS', 'JavaScript', 'WordPress', 'Web Development'],
    skillDetails: [
      { name: 'HTML', level: 'intermediate', years: 3 }
    ],
    packages: [],
    portfolio: [],
    certifications: [],
    completedProjects: 19,
    completedOrders: 19,
    score: 86,
    breakdown: { skill: 35, budget: 20, deadline: 15, rating: 8, experience: 4, availability: 4 },
    rationale: '86% Match: Budget-friendly provider ideal for 4-day delivery constraints.'
  }
];

export const DEMO_REQUEST = "I need a responsive restaurant website with menu, contact form and booking section. My budget is $100 and I need it in 4 days.";

export const MOCK_CATEGORIES = ['Web Development', 'Design', 'Writing', 'Marketing', 'Data Entry'];
