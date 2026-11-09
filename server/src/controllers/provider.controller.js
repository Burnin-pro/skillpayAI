import * as providerRepository from '../repositories/providerRepository.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

export const getProviders = async (req, res) => {
  const { search, skills, minPrice, maxPrice, availability, sort } = req.query;
  const parsedSkills = skills ? skills.split(',').map(s => s.trim()) : [];
  
  const providers = await providerRepository.searchProviders({
    search,
    skills: parsedSkills,
    minPrice,
    maxPrice,
    availability,
    publishedOnly: true // Public discovery only shows published profiles
  });

  if (sort === 'price_asc') {
    providers.sort((a, b) => (a.basePriceCents || 0) - (b.basePriceCents || 0));
  } else if (sort === 'price_desc') {
    providers.sort((a, b) => (b.basePriceCents || 0) - (a.basePriceCents || 0));
  } else if (sort === 'rating') {
    providers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    // Default score / experience sort
    providers.sort((a, b) => (b.score || b.experienceYears || 0) - (a.score || a.experienceYears || 0));
  }

  res.json(providers);
};

export const getProviderById = async (req, res) => {
  const provider = await providerRepository.getProviderById(req.params.id);
  if (!provider) {
    throw new AppError('Provider not found', 404, ErrorCodes.NOT_FOUND);
  }

  // Unpublished profiles only viewable by owner or admin
  const isOwner = req.user && req.user.uid === req.params.id;
  const isAdmin = req.user && req.user.role === 'admin';
  if (!provider.published && !isOwner && !isAdmin) {
    throw new AppError('This profile is not currently published', 404, ErrorCodes.NOT_FOUND);
  }

  res.json(provider);
};

export const updateMyProfile = async (req, res) => {
  if (req.user.role !== 'provider') {
    throw new AppError('Only freelancers can update provider profiles', 403, ErrorCodes.FORBIDDEN);
  }

  const allowedFields = [
    'name',
    'headline',
    'bio',
    'location',
    'languages',
    'timezone',
    'skillNames',
    'experienceYears',
    'basePriceCents',
    'projectRateCents',
    'hourlyRateCents',
    'deliveryDaysTypical',
    'revisionsIncluded',
    'packages',
    'portfolio',
    'certifications',
    'availability',
    'weeklyCapacity',
    'responseTimeHours',
    'paypalEmail',
    'onboardingStep'
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  const updated = await providerRepository.updateProvider(req.user.uid, updateData);
  res.json(updated);
};

export const publishMyProfile = async (req, res) => {
  if (req.user.role !== 'provider') {
    throw new AppError('Only freelancers can publish profiles', 403, ErrorCodes.FORBIDDEN);
  }

  const { publish = true } = req.body;
  try {
    const updated = await providerRepository.publishProvider(req.user.uid, publish);
    res.json(updated);
  } catch (err) {
    throw new AppError(err.message, 400, ErrorCodes.BAD_REQUEST);
  }
};
