import { z } from 'zod';
import * as jobRepository from '../repositories/jobRepository.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

export const jobSchema = z.object({
  body: z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    category: z.string(),
    requiredSkills: z.array(z.string()).default([]),
    budgetCents: z.number().positive(),
    currency: z.string().default('USD'),
    deadlineDays: z.number().positive(),
    complexity: z.enum(['low', 'medium', 'high']),
  })
});

export const updateJobSchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(10).optional(),
    category: z.string().optional(),
    requiredSkills: z.array(z.string()).optional(),
    budgetCents: z.number().positive().optional(),
    deadlineDays: z.number().positive().optional(),
    complexity: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['draft', 'open', 'matched', 'in_negotiation', 'agreed', 'ordered', 'completed', 'cancelled']).optional(),
    savedProviderIds: z.array(z.string()).optional()
  })
});

export const createJob = async (req, res) => {
  const jobData = {
    ...req.body,
    customerId: req.user.uid,
    status: 'open',
    savedProviderIds: []
  };
  const job = await jobRepository.createJob(jobData);
  res.status(201).json(job);
};

export const getJobs = async (req, res) => {
  // If customer, return their jobs
  if (req.user.role === 'customer') {
    const jobs = await jobRepository.getCustomerJobs(req.user.uid);
    return res.json(jobs);
  }
  
  // If provider or admin, return open jobs (for demo simplicity)
  const jobs = await jobRepository.getAllOpenJobs();
  res.json(jobs);
};

export const getJobById = async (req, res) => {
  const job = await jobRepository.getJobById(req.params.id);
  if (!job) throw new AppError('Job not found', 404, ErrorCodes.NOT_FOUND);
  
  // Auth check: only the owner or an admin/provider can view it
  if (req.user.role === 'customer' && job.customerId !== req.user.uid) {
    throw new AppError('Access denied', 403, ErrorCodes.FORBIDDEN);
  }
  
  res.json(job);
};

export const updateJob = async (req, res) => {
  const job = await jobRepository.getJobById(req.params.id);
  if (!job) throw new AppError('Job not found', 404, ErrorCodes.NOT_FOUND);
  
  if (req.user.role === 'customer' && job.customerId !== req.user.uid) {
    throw new AppError('Access denied', 403, ErrorCodes.FORBIDDEN);
  }

  const updated = await jobRepository.updateJob(req.params.id, req.body);
  res.json(updated);
};

export const deleteJob = async (req, res) => {
  const job = await jobRepository.getJobById(req.params.id);
  if (!job) throw new AppError('Job not found', 404, ErrorCodes.NOT_FOUND);
  
  if (job.customerId !== req.user.uid && req.user.role !== 'admin') {
    throw new AppError('Access denied', 403, ErrorCodes.FORBIDDEN);
  }

  await jobRepository.deleteJob(req.params.id);
  res.status(204).send();
};
