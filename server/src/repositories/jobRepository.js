import { db } from '../config/firebase.js';

const JOBS = 'jobs';

export const createJob = async (jobData) => {
  const now = new Date().toISOString();
  const docRef = db.collection(JOBS).doc();
  const job = {
    ...jobData,
    createdAt: now,
    updatedAt: now
  };
  await docRef.set(job);
  return { id: docRef.id, ...job };
};

export const getJobById = async (id) => {
  const doc = await db.collection(JOBS).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

export const updateJob = async (id, data) => {
  const now = new Date().toISOString();
  await db.collection(JOBS).doc(id).set({
    ...data,
    updatedAt: now
  }, { merge: true });
  return await getJobById(id);
};

export const deleteJob = async (id) => {
  await db.collection(JOBS).doc(id).delete();
};

export const getCustomerJobs = async (customerId) => {
  const snapshot = await db.collection(JOBS)
    .where('customerId', '==', customerId)
    .orderBy('createdAt', 'desc')
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllOpenJobs = async () => {
  const snapshot = await db.collection(JOBS)
    .where('status', '==', 'open')
    .orderBy('createdAt', 'desc')
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
