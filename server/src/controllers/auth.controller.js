import { z } from 'zod';
import * as userRepository from '../repositories/userRepository.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { db } from '../config/firebase.js';

export const profileSchema = z.object({
  body: z.object({
    role: z.enum(['customer', 'provider']), // Admin is not allowed via client
    name: z.string().min(2),
    bio: z.string().optional(),
    location: z.string().optional(),
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    role: z.enum(['customer', 'provider']).optional(),
    name: z.string().min(2).optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    photoURL: z.string().optional(),
    avatar: z.string().optional(),
    skillNames: z.array(z.string()).optional(),
    experienceYears: z.number().optional(),
    projectRateCents: z.number().optional(),
    availability: z.enum(['available', 'busy', 'away']).optional(),
    portfolio: z.array(z.object({ title: z.string(), url: z.string() })).optional(),
    paypalEmail: z.string().email().optional().or(z.literal('')).or(z.null()),
    profileComplete: z.boolean().optional()
  })
});

export const createProfile = async (req, res) => {
  const { uid, email } = req.user;
  const { role, name, bio, location } = req.body;
  const existing = await userRepository.getUserById(uid);
  
  if (existing) {
    const updated = await userRepository.updateUser(uid, {
      role: role || existing.role || 'customer',
      name: name || existing.name || 'User',
      bio: bio || existing.bio || '',
      location: location || existing.location || ''
    });
    return res.status(200).json(updated);
  }
  
  const userData = {
    email,
    role: role || 'customer',
    name: name || 'User',
    bio: bio || '',
    location: location || '',
    rating: 0,
    ratingCount: 0,
    completedOrders: 0,
    isDemo: false
  };

  if (role === 'provider') {
    userData.skillNames = [];
    userData.experienceYears = 0;
    userData.projectRateCents = 0;
    userData.availability = 'available';
    userData.portfolio = [];
    userData.paypalEmail = '';
  }

  const created = await userRepository.createUser(uid, userData);
  res.status(201).json(created);
};

export const getMe = async (req, res) => {
  let profile = await userRepository.getUserById(req.user.uid);
  if (!profile && req.user.email) {
    profile = await userRepository.getUserByEmail(req.user.email);
    if (profile) {
      // Link this doc to the current UID
      await userRepository.updateUser(req.user.uid, profile);
    }
  }

  if (!profile) {
    const isProvider = req.user.role === 'provider' || req.user.email?.toLowerCase().includes('provider');
    const role = isProvider ? 'provider' : (req.user.role || 'customer');
    const userData = {
      email: req.user.email || '',
      role: role,
      name: req.user.profile?.name || (req.user.email ? req.user.email.split('@')[0] : 'User'),
      bio: isProvider ? 'Full-Stack Developer & Technical Specialist' : '',
      location: 'Remote (Global)',
      rating: 5.0,
      ratingCount: 0,
      completedOrders: 0,
      isDemo: Boolean(req.user.email?.includes('demo'))
    };

    if (role === 'provider') {
      userData.skillNames = ['React', 'JavaScript', 'Node.js', 'TailwindCSS'];
      userData.experienceYears = 5;
      userData.projectRateCents = 11000;
      userData.basePriceCents = 11000;
      userData.availability = 'available';
      userData.published = true;
      userData.profileCompleteness = 100;
    }

    profile = await userRepository.createUser(req.user.uid, userData);
  }
  res.json(profile);
};

export const updateMe = async (req, res) => {
  const profile = await userRepository.getUserById(req.user.uid);
  if (!profile) {
    throw new AppError('Profile not found', 404, ErrorCodes.NOT_FOUND);
  }

  const updated = await userRepository.updateUser(req.user.uid, req.body);
  res.json(updated);
};
