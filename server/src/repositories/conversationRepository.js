import { db } from '../config/firebase.js';

const CONVERSATIONS = 'conversations';

export const getOrCreateConversation = async ({ customerId, providerId, hireRequestId = null, jobId = null }) => {
  const query = await db.collection(CONVERSATIONS)
    .where('participantIds', 'array-contains', customerId)
    .get()
    .catch(() => ({ docs: [] }));

  const existing = query.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .find(c => c.participantIds.includes(providerId));

  if (existing) {
    if (hireRequestId && !existing.hireRequestId) {
      await db.collection(CONVERSATIONS).doc(existing.id).update({ hireRequestId });
      existing.hireRequestId = hireRequestId;
    }
    return existing;
  }

  const now = new Date().toISOString();
  const convData = {
    participantIds: [customerId, providerId],
    customerId,
    providerId,
    hireRequestId,
    jobId,
    lastMessage: 'Conversation started',
    lastMessageAt: now,
    unreadBy: {
      [customerId]: 0,
      [providerId]: 0
    },
    createdAt: now,
    updatedAt: now
  };

  const docRef = db.collection(CONVERSATIONS).doc();
  await docRef.set(convData);
  return { id: docRef.id, ...convData };
};

export const getConversationsByUser = async (uid) => {
  const snapshot = await db.collection(CONVERSATIONS)
    .where('participantIds', 'array-contains', uid)
    .get()
    .catch(() => ({ docs: [] }));

  const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return list.sort((a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt));
};

export const getConversationById = async (id, uid) => {
  const doc = await db.collection(CONVERSATIONS).doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data();
  if (!data.participantIds.includes(uid)) {
    throw new Error('Not authorized to view this conversation');
  }
  return { id: doc.id, ...data };
};

export const getMessages = async (conversationId, uid) => {
  // Verify access
  await getConversationById(conversationId, uid);

  const snapshot = await db.collection(CONVERSATIONS).doc(conversationId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .get()
    .catch(() => ({ docs: [] }));

  // Mark unread as 0 for this user
  db.collection(CONVERSATIONS).doc(conversationId).update({
    [`unreadBy.${uid}`]: 0
  }).catch(() => {});

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const sendMessage = async (conversationId, senderId, body) => {
  const conv = await getConversationById(conversationId, senderId);
  const now = new Date().toISOString();

  const recipientId = conv.participantIds.find(id => id !== senderId);
  const currentUnread = (conv.unreadBy && conv.unreadBy[recipientId]) || 0;

  const msgRef = db.collection(CONVERSATIONS).doc(conversationId).collection('messages').doc();
  const messageData = {
    senderId,
    body,
    createdAt: now
  };
  await msgRef.set(messageData);

  await db.collection(CONVERSATIONS).doc(conversationId).update({
    lastMessage: body,
    lastMessageAt: now,
    [`unreadBy.${recipientId}`]: currentUnread + 1,
    [`unreadBy.${senderId}`]: 0,
    updatedAt: now
  });

  return { id: msgRef.id, ...messageData };
};

export const deleteConversation = async (conversationId, uid) => {
  const conv = await getConversationById(conversationId, uid);
  if (!conv) return { success: true };
  await db.collection(CONVERSATIONS).doc(conversationId).delete().catch(() => {});
  return { success: true, id: conversationId };
};
