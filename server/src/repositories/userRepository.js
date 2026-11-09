import { db } from '../config/firebase.js';

const USERS = 'users';

export const getUserById = async (uid) => {
  const doc = await db.collection(USERS).doc(uid).get();
  if (!doc.exists) {
    // If not found by uid, check if uid is an alias (e.g. u_provider)
    if (uid === 'u_provider' || uid === 'provider_muthu') {
      const pDoc = await db.collection(USERS).doc('u_provider').get();
      if (pDoc.exists) return { id: pDoc.id, ...pDoc.data() };
    }
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

export const getUserByEmail = async (email) => {
  if (!email) return null;
  const snapshot = await db.collection(USERS).where('email', '==', email.toLowerCase().trim()).limit(1).get();
  if (snapshot.empty) {
    // Check fallback aliases for demo users
    if (email.toLowerCase().includes('provider')) {
      const pDoc = await db.collection(USERS).doc('u_provider').get();
      if (pDoc.exists) return { id: pDoc.id, ...pDoc.data() };
    }
    return null;
  }
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

export const createUser = async (uid, data) => {
  const now = new Date().toISOString();
  const userData = {
    ...data,
    createdAt: now,
    updatedAt: now,
    profileComplete: false
  };
  await db.collection(USERS).doc(uid).set(userData);
  return { id: uid, ...userData };
};

export const updateUser = async (uid, data) => {
  const now = new Date().toISOString();
  await db.collection(USERS).doc(uid).set({
    ...data,
    updatedAt: now
  }, { merge: true });
  return await getUserById(uid);
};
