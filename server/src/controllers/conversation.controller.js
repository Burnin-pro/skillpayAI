import * as conversationRepository from '../repositories/conversationRepository.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

export const getConversations = async (req, res) => {
  const conversations = await conversationRepository.getConversationsByUser(req.user.uid);
  res.json(conversations);
};

export const getMessages = async (req, res) => {
  try {
    const messages = await conversationRepository.getMessages(req.params.id, req.user.uid);
    res.json(messages);
  } catch (err) {
    throw new AppError(err.message, 403, ErrorCodes.FORBIDDEN);
  }
};

export const sendMessage = async (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) {
    throw new AppError('Message body cannot be empty', 400, ErrorCodes.BAD_REQUEST);
  }

  try {
    const message = await conversationRepository.sendMessage(req.params.id, req.user.uid, body.trim());
    res.status(201).json(message);
  } catch (err) {
    throw new AppError(err.message, 403, ErrorCodes.FORBIDDEN);
  }
};

export const createConversation = async (req, res) => {
  const { providerId, customerId, hireRequestId } = req.body;
  const targetCustomer = customerId || req.user.uid;
  const targetProvider = providerId || req.user.uid;

  const conv = await conversationRepository.getOrCreateConversation({
    customerId: targetCustomer,
    providerId: targetProvider,
    hireRequestId
  });

  res.status(201).json(conv);
};

export const deleteConversation = async (req, res) => {
  try {
    await conversationRepository.deleteConversation(req.params.id, req.user.uid);
    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (err) {
    throw new AppError(err.message, 403, ErrorCodes.FORBIDDEN);
  }
};
