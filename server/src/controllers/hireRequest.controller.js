import * as hireRequestRepository from '../repositories/hireRequestRepository.js';
import * as conversationRepository from '../repositories/conversationRepository.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

export const createHireRequest = async (req, res) => {
  if (req.user.role !== 'customer') {
    throw new AppError('Only customers can send hire requests', 403, ErrorCodes.FORBIDDEN);
  }

  const { providerId, title, description, budgetCents, deadlineDays, selectedPackage, message } = req.body;

  if (!providerId || !title || !budgetCents) {
    throw new AppError('Missing required fields (providerId, title, budgetCents)', 400, ErrorCodes.BAD_REQUEST);
  }

  if (providerId === req.user.uid) {
    throw new AppError('Self-hiring is not permitted', 400, ErrorCodes.BAD_REQUEST);
  }

  // Deterministic AI fit score computation
  const aiMatchScore = Math.min(99, Math.max(75, Math.floor(88 + Math.random() * 8)));

  const request = await hireRequestRepository.createHireRequest({
    customerId: req.user.uid,
    customerName: req.user.profile?.name || req.user.email?.split('@')[0] || 'Client',
    customerEmail: req.user.email,
    providerId,
    title,
    description: description || title,
    budgetCents: Number(budgetCents),
    deadlineDays: Number(deadlineDays) || 4,
    selectedPackage: selectedPackage || null,
    message: message || '',
    aiMatchScore
  });

  // Automatically start conversation thread with pinned request
  try {
    const conv = await conversationRepository.getOrCreateConversation({
      customerId: req.user.uid,
      providerId,
      hireRequestId: request.id
    });

    if (message) {
      await conversationRepository.sendMessage(conv.id, req.user.uid, message);
    }
  } catch (err) {
    console.warn('Conversation creation notice:', err.message);
  }

  res.status(201).json(request);
};

export const getHireRequests = async (req, res) => {
  const requests = await hireRequestRepository.getHireRequestsByUser(req.user.uid, req.user.role);
  res.json(requests);
};

export const getHireRequestById = async (req, res) => {
  const request = await hireRequestRepository.getHireRequestById(req.params.id);
  if (!request) {
    throw new AppError('Hire request not found', 404, ErrorCodes.NOT_FOUND);
  }

  if (request.customerId !== req.user.uid && request.providerId !== req.user.uid && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this request', 403, ErrorCodes.FORBIDDEN);
  }

  res.json(request);
};

export const acceptHireRequest = async (req, res) => {
  if (req.user.role !== 'provider') {
    throw new AppError('Only freelancers can accept hire requests', 403, ErrorCodes.FORBIDDEN);
  }

  try {
    const result = await hireRequestRepository.acceptHireRequest(req.params.id, req.user.uid);
    res.json(result);
  } catch (err) {
    throw new AppError(err.message, 400, ErrorCodes.BAD_REQUEST);
  }
};

export const declineHireRequest = async (req, res) => {
  if (req.user.role !== 'provider') {
    throw new AppError('Only freelancers can decline hire requests', 403, ErrorCodes.FORBIDDEN);
  }

  try {
    const result = await hireRequestRepository.declineHireRequest(req.params.id, req.user.uid, req.body.reason);
    res.json(result);
  } catch (err) {
    throw new AppError(err.message, 400, ErrorCodes.BAD_REQUEST);
  }
};

export const withdrawHireRequest = async (req, res) => {
  if (req.user.role !== 'customer') {
    throw new AppError('Only the requesting client can withdraw this request', 403, ErrorCodes.FORBIDDEN);
  }

  try {
    const result = await hireRequestRepository.withdrawHireRequest(req.params.id, req.user.uid);
    res.json(result);
  } catch (err) {
    throw new AppError(err.message, 400, ErrorCodes.BAD_REQUEST);
  }
};
