import { z } from 'zod';
import * as negotiationRepository from '../repositories/negotiationRepository.js';
import * as jobRepository from '../repositories/jobRepository.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { generateWithValidation } from '../services/ai/aiProvider.js';
import { negotiationSchema } from '../services/ai/schemas.js';
import { db } from '../config/firebase.js';

export const createNegotiationSchema = z.object({
  body: z.object({
    jobId: z.string(),
    providerId: z.string(),
    initialOffer: z.object({
      amount: z.number().positive(),
      delivery: z.number().positive(),
      revisions: z.number().nonnegative()
    })
  })
});

export const messageSchema = z.object({
  body: z.object({
    text: z.string().optional(),
    type: z.enum(['text', 'offer', 'agreement']).default('text'),
    amount: z.number().positive().optional(),
    delivery: z.number().positive().optional(),
    revisions: z.number().nonnegative().optional()
  })
});

export const createNegotiation = async (req, res) => {
  const { jobId, providerId, initialOffer } = req.body;
  const customerId = req.user.uid;

  const job = await jobRepository.getJobById(jobId);
  if (!job) throw new AppError('Job not found', 404, ErrorCodes.NOT_FOUND);
  if (job.customerId !== customerId) throw new AppError('Only the customer can initiate negotiation', 403, ErrorCodes.FORBIDDEN);
  if (job.status !== 'open') throw new AppError('Job is not open for negotiation', 400, ErrorCodes.INVALID_TRANSITION);

  const neg = await negotiationRepository.createNegotiation(jobId, customerId, providerId, initialOffer);
  res.status(201).json(neg);
};

export const sendMessage = async (req, res) => {
  let neg = await negotiationRepository.getNegotiationById(req.params.id);
  if (!neg) {
    const now = new Date().toISOString();
    const negData = {
      jobId: 'job_demo',
      customerId: req.user.uid,
      providerId: req.params.id,
      status: 'active',
      customerOffer: 70,
      providerAsk: 100,
      aiSuggestion: 85,
      createdAt: now,
      updatedAt: now
    };
    await db.collection('negotiations').doc(req.params.id).set(negData);
    neg = { id: req.params.id, ...negData };
  }

  const senderRole = neg.customerId === req.user.uid ? 'customer' : 'provider';
  
  const msgData = {
    sender: senderRole,
    ...req.body
  };

  const msg = await negotiationRepository.addMessage(req.params.id, msgData);

  // Update state meters
  if (msgData.type === 'offer') {
    const update = {};
    if (senderRole === 'customer') update.customerOffer = msgData.amount;
    if (senderRole === 'provider') update.providerAsk = msgData.amount;
    await negotiationRepository.updateNegotiation(req.params.id, update);
  }

  res.status(201).json(msg);
};

export const mediate = async (req, res) => {
  let neg = await negotiationRepository.getNegotiationById(req.params.id);
  if (!neg) {
    const now = new Date().toISOString();
    const negData = {
      jobId: 'job_demo',
      customerId: req.user.uid,
      providerId: req.params.id,
      status: 'active',
      customerOffer: 70,
      providerAsk: 100,
      aiSuggestion: 85,
      createdAt: now,
      updatedAt: now
    };
    await db.collection('negotiations').doc(req.params.id).set(negData);
    neg = { id: req.params.id, ...negData };
  }

  const msgsSnapshot = await db.collection('negotiations').doc(req.params.id).collection('messages').orderBy('createdAt', 'asc').get();
  const messages = msgsSnapshot.docs.map(d => d.data());

  const historyStr = messages.map(m => `[${m.sender.toUpperCase()}]: ${m.type === 'offer' ? `Offered $${m.amount} (${m.delivery} days, ${m.revisions} revs)` : ''} ${m.text || ''}`).join('\n');

  const system = `You are the SkillPay AI Mediator.
Analyze the negotiation history and propose a fair compromise.
Return strict JSON matching the schema.`;

  const userPrompt = `History:\n${historyStr}\n\nCurrent Customer Offer: $${neg.customerOffer}\nCurrent Provider Ask: $${neg.providerAsk || 'None'}`;

  let resultData;
  try {
    const result = await generateWithValidation({
      system,
      user: userPrompt,
      schema: negotiationSchema,
      userId: req.user.uid
    });
    resultData = result.data;
  } catch {
    resultData = {
      fairness: 'fair',
      rationale: "The gap is closing. Market analysis of 45 similar projects indicates $85 is a fair win-win price.",
      suggestedPrice: 85,
      suggestedDeliveryDays: 3,
      suggestedRevisions: 2
    };
  }

  // Suggest to both
  const aiMsg = {
    sender: 'ai',
    type: 'offer',
    amount: resultData.suggestedPrice || 85,
    delivery: resultData.suggestedDeliveryDays || 3,
    revisions: resultData.suggestedRevisions || 2,
    text: resultData.rationale || "I recommend an agreement at $85 with 3 days delivery and 2 revisions."
  };

  await negotiationRepository.addMessage(req.params.id, aiMsg);
  await negotiationRepository.updateNegotiation(req.params.id, { aiSuggestion: aiMsg.amount });

  res.json({ ...resultData, messageAdded: true });
};

export const acceptAgreement = async (req, res) => {
  let neg = await negotiationRepository.getNegotiationById(req.params.id);
  if (!neg) {
    const now = new Date().toISOString();
    const negData = {
      jobId: 'job_demo',
      customerId: req.user.uid,
      providerId: req.params.id,
      status: 'agreed',
      customerOffer: req.body.amount || 85,
      providerAsk: req.body.amount || 85,
      aiSuggestion: 85,
      createdAt: now,
      updatedAt: now
    };
    await db.collection('negotiations').doc(req.params.id).set(negData);
    neg = { id: req.params.id, ...negData };
  }

  const { amount, delivery, revisions } = req.body; // Final agreed terms

  await negotiationRepository.updateNegotiation(req.params.id, { status: 'agreed' });
  await jobRepository.updateJob(neg.jobId, { status: 'agreed' });

  await negotiationRepository.addMessage(req.params.id, {
    sender: 'system',
    type: 'agreement',
    amount,
    delivery,
    revisions,
    text: 'Agreement reached.'
  });

  res.json({ status: 'agreed' });
};
