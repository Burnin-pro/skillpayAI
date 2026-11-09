import admin from '../src/config/firebase.js';
import pino from 'pino';

const logger = pino();
const auth = admin.auth();
const db = admin.firestore();

const USERS = [
  {
    uid: 'u_customer',
    email: 'demo-customer@skillpay.demo',
    password: 'demo1234',
    name: 'Demo Customer',
    role: 'customer',
    bio: 'I run an Italian restaurant and need an online menu and booking page.',
    isDemo: true
  },
  {
    uid: 'u_provider',
    email: 'demo-provider@skillpay.demo',
    password: 'demo1234',
    name: 'Muthu Kumar',
    role: 'provider',
    headline: 'Senior Full-Stack & Fintech React Developer',
    bio: 'Senior Full-Stack Developer with 6+ years of experience building modern React web apps, high-conversion landing pages, and verified escrow fintech tools.',
    skillNames: ['React', 'JavaScript', 'Node.js', 'HTML', 'CSS', 'TailwindCSS', 'Web Development'],
    skills: ['React', 'JavaScript', 'Node.js', 'HTML', 'CSS', 'TailwindCSS', 'Web Development'],
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
    isDemo: true
  },
  {
    uid: 'u_provider_sarah',
    email: 'sarah-partial@skillpay.demo',
    password: 'demo1234',
    name: 'Sarah Jenkins',
    role: 'provider',
    headline: 'UI/UX Designer',
    bio: 'Visual designer specializing in Figma prototypes and design systems.',
    skillNames: ['Figma', 'UI/UX Design'],
    experienceYears: 3,
    basePriceCents: 9000,
    projectRateCents: 9000,
    availability: 'available',
    published: false,
    profileCompleteness: 55,
    onboardingStep: 3,
    isDemo: true
  },
  {
    uid: 'u_provider_elena',
    email: 'elena-partial@skillpay.demo',
    password: 'demo1234',
    name: 'Elena Rostova',
    role: 'provider',
    headline: 'Full-Stack Python Engineer',
    bio: 'Backend developer focused on microservices and API gateways.',
    skillNames: ['Python', 'Django', 'PostgreSQL'],
    experienceYears: 4,
    basePriceCents: 11000,
    projectRateCents: 11000,
    availability: 'busy',
    published: false,
    profileCompleteness: 65,
    onboardingStep: 4,
    isDemo: true
  },
  {
    uid: 'u_admin',
    email: 'admin@skillpay.demo',
    password: 'demo1234',
    name: 'Admin',
    role: 'admin',
    isDemo: true
  }
];

async function seed() {
  logger.info('Starting seed...');
  for (const u of USERS) {
    try {
      try {
        const existing = await auth.getUserByEmail(u.email);
        await auth.deleteUser(existing.uid);
      } catch (e) {
        if (e.code !== 'auth/user-not-found') throw e;
      }

      const userRecord = await auth.createUser({
        uid: u.uid,
        email: u.email,
        password: u.password,
        displayName: u.name,
      });

      if (u.role === 'admin') {
        await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
      }

      const { password, ...profileData } = u;
      
      const fullProfile = {
        ...profileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: u.role === 'provider' ? 4.9 : 0,
        ratingCount: u.role === 'provider' ? 12 : 0,
        completedOrders: u.role === 'provider' ? 42 : 0,
        location: 'San Francisco, CA'
      };

      await db.collection('users').doc(userRecord.uid).set(fullProfile);
      logger.info(`Seeded user: ${u.email} (${u.role})`);
    } catch (error) {
      logger.error({ error }, `Failed to seed user ${u.email}`);
    }
  }

  // Seed 1 pending hire request
  try {
    const hireReqRef = db.collection('hireRequests').doc('hr_restaurant_demo');
    await hireReqRef.set({
      customerId: 'u_customer',
      customerName: 'Demo Customer',
      customerEmail: 'demo-customer@skillpay.demo',
      providerId: 'u_provider',
      title: 'Responsive Restaurant Website & Online Menu',
      description: 'Need a responsive restaurant website with an interactive digital menu, contact form, and table reservation booking section.',
      budgetCents: 10000,
      deadlineDays: 4,
      selectedPackage: {
        tier: 'standard',
        title: 'Full Restaurant Website & Menu',
        priceCents: 10000
      },
      message: 'Hi Muthu, I checked your profile and your experience with React menus looks ideal for our restaurant launch. Can you deliver this in 4 days?',
      aiMatchScore: 94,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    logger.info('Seeded demo hire request: hr_restaurant_demo');
  } catch (e) {
    logger.error('Failed to seed hire request', e);
  }

  // Seed 1 conversation with messages
  try {
    const convRef = db.collection('conversations').doc('conv_restaurant_demo');
    await convRef.set({
      participantIds: ['u_customer', 'u_provider'],
      customerId: 'u_customer',
      providerId: 'u_provider',
      hireRequestId: 'hr_restaurant_demo',
      lastMessage: 'Hi Muthu, looking forward to discussing the project with you!',
      lastMessageAt: new Date().toISOString(),
      unreadBy: {
        u_provider: 1,
        u_customer: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await convRef.collection('messages').doc('msg_1').set({
      senderId: 'u_customer',
      body: 'Hi Muthu, I sent you a hire request for our Italian restaurant site. We have our brand assets and menu ready.',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    });

    await convRef.collection('messages').doc('msg_2').set({
      senderId: 'u_customer',
      body: 'Looking forward to discussing the project with you!',
      createdAt: new Date().toISOString()
    });
    logger.info('Seeded demo conversation: conv_restaurant_demo');
  } catch (e) {
    logger.error('Failed to seed conversation', e);
  }

  logger.info('Seed completed successfully.');
  process.exit(0);
}

seed();
