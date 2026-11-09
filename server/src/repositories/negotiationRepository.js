import { db } from '../config/firebase.js';

const NEGOTIATIONS = 'negotiations';
const JOBS = 'jobs';

export const createNegotiation = async (jobId, customerId, providerId, initialOffer) => {
  const now = new Date().toISOString();
  
  // Update job status
  await db.collection(JOBS).doc(jobId).update({
    status: 'in_negotiation',
    updatedAt: now
  });

  const negData = {
    jobId,
    customerId,
    providerId,
    status: 'active',
    customerOffer: initialOffer.amount,
    providerAsk: 0, // 0 until provider counters
    aiSuggestion: 0,
    createdAt: now,
    updatedAt: now
  };

  const docRef = db.collection(NEGOTIATIONS).doc();
  await docRef.set(negData);
  
  // Add initial message
  await docRef.collection('messages').add({
    sender: 'customer',
    type: 'offer',
    amount: initialOffer.amount,
    delivery: initialOffer.delivery,
    revisions: initialOffer.revisions,
    text: "I'd like to work with you on this project.",
    createdAt: now
  });

  return { id: docRef.id, ...negData };
};

export const getNegotiationById = async (id) => {
  const doc = await db.collection(NEGOTIATIONS).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

export const updateNegotiation = async (id, data) => {
  const now = new Date().toISOString();
  await db.collection(NEGOTIATIONS).doc(id).update({
    ...data,
    updatedAt: now
  });
  return await getNegotiationById(id);
};

export const addMessage = async (negotiationId, message) => {
  const now = new Date().toISOString();
  const msgDoc = await db.collection(NEGOTIATIONS).doc(negotiationId).collection('messages').add({
    ...message,
    createdAt: now
  });
  return { id: msgDoc.id, ...message, createdAt: now };
};
