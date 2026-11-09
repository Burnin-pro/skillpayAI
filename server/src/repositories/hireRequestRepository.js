import { db } from '../config/firebase.js';

const HIRE_REQUESTS = 'hireRequests';
const JOBS = 'jobs';
const NEGOTIATIONS = 'negotiations';

export const createHireRequest = async (data) => {
  const now = new Date().toISOString();
  const requestData = {
    ...data,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  };

  const docRef = db.collection(HIRE_REQUESTS).doc();
  await docRef.set(requestData);
  return { id: docRef.id, ...requestData };
};

export const getHireRequestById = async (id) => {
  const doc = await db.collection(HIRE_REQUESTS).doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data();

  // Check 7-day expiration
  if (data.status === 'pending') {
    const createdTime = new Date(data.createdAt).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - createdTime > sevenDaysMs) {
      data.status = 'expired';
      await db.collection(HIRE_REQUESTS).doc(id).update({ status: 'expired', updatedAt: new Date().toISOString() });
    }
  }

  return { id: doc.id, ...data };
};

export const getHireRequestsByUser = async (uid, role) => {
  const field = role === 'provider' ? 'providerId' : 'customerId';
  const snapshot = await db.collection(HIRE_REQUESTS).where(field, '==', uid).get().catch(() => ({ docs: [] }));
  
  const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Check expiration for pending items
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  for (const req of requests) {
    if (req.status === 'pending' && now - new Date(req.createdAt).getTime() > sevenDaysMs) {
      req.status = 'expired';
      db.collection(HIRE_REQUESTS).doc(req.id).update({ status: 'expired' }).catch(() => {});
    }
  }

  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const acceptHireRequest = async (requestId, providerId) => {
  const reqRef = db.collection(HIRE_REQUESTS).doc(requestId);
  
  return await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(reqRef);
    if (!doc.exists) {
      throw new Error('Hire request not found');
    }
    const data = doc.data();

    if (data.providerId !== providerId) {
      throw new Error('Not authorized to accept this request');
    }

    if (data.status !== 'pending') {
      throw new Error(`Cannot accept request in status: ${data.status}`);
    }

    const createdTime = new Date(data.createdAt).getTime();
    if (Date.now() - createdTime > 7 * 24 * 60 * 60 * 1000) {
      transaction.update(reqRef, { status: 'expired', updatedAt: new Date().toISOString() });
      throw new Error('This request has expired');
    }

    const now = new Date().toISOString();
    let jobId = data.jobId;

    if (!jobId) {
      // Create a job for this accepted request
      const jobRef = db.collection(JOBS).doc();
      jobId = jobRef.id;
      transaction.set(jobRef, {
        customerId: data.customerId,
        title: data.title,
        description: data.description,
        budget: data.budgetCents ? data.budgetCents / 100 : 85,
        deadlineDays: data.deadlineDays || 4,
        status: 'in_negotiation',
        createdAt: now,
        updatedAt: now
      });
    }

    // Create negotiation document
    const negRef = db.collection(NEGOTIATIONS).doc();
    const negData = {
      jobId,
      customerId: data.customerId,
      providerId: data.providerId,
      status: 'active',
      customerOffer: data.budgetCents ? data.budgetCents / 100 : 85,
      providerAsk: data.budgetCents ? data.budgetCents / 100 : 85,
      aiSuggestion: data.budgetCents ? data.budgetCents / 100 : 85,
      createdAt: now,
      updatedAt: now
    };
    transaction.set(negRef, negData);

    // Initial negotiation message
    const msgRef = negRef.collection('messages').doc();
    transaction.set(msgRef, {
      sender: 'provider',
      type: 'accept',
      amount: negData.customerOffer,
      delivery: data.deadlineDays || 4,
      revisions: 2,
      text: `Hello! I have accepted your request for "${data.title}". Let's finalize the details here in the Deal Room.`,
      createdAt: now
    });

    // Update hire request status
    transaction.update(reqRef, {
      status: 'accepted',
      negotiationId: negRef.id,
      jobId,
      updatedAt: now
    });

    return {
      hireRequest: { id: requestId, ...data, status: 'accepted', negotiationId: negRef.id, jobId },
      negotiation: { id: negRef.id, ...negData }
    };
  });
};

export const declineHireRequest = async (requestId, providerId, reason = '') => {
  const doc = await getHireRequestById(requestId);
  if (!doc) throw new Error('Hire request not found');
  if (doc.providerId !== providerId) throw new Error('Not authorized to decline this request');
  if (doc.status !== 'pending') throw new Error(`Cannot decline request with status ${doc.status}`);

  const now = new Date().toISOString();
  await db.collection(HIRE_REQUESTS).doc(requestId).update({
    status: 'declined',
    declineReason: reason,
    updatedAt: now
  });

  return { ...doc, status: 'declined', declineReason: reason, updatedAt: now };
};

export const withdrawHireRequest = async (requestId, customerId) => {
  const doc = await getHireRequestById(requestId);
  if (!doc) throw new Error('Hire request not found');
  if (doc.customerId !== customerId) throw new Error('Not authorized to withdraw this request');
  if (doc.status !== 'pending') throw new Error(`Cannot withdraw request with status ${doc.status}`);

  const now = new Date().toISOString();
  await db.collection(HIRE_REQUESTS).doc(requestId).update({
    status: 'withdrawn',
    updatedAt: now
  });

  return { ...doc, status: 'withdrawn', updatedAt: now };
};
