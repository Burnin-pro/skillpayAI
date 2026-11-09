import { db } from '../config/firebase.js';

const ORDERS = 'orders';

export const createOrder = async (orderId, orderData) => {
  const now = new Date().toISOString();
  const data = {
    ...orderData,
    id: orderId, // The app's internal order ID, can be same as PayPal or custom
    status: 'pending', // pending -> paid -> completed -> released
    createdAt: now,
    updatedAt: now
  };
  await db.collection(ORDERS).doc(orderId).set(data);
  return data;
};

export const getOrderById = async (id) => {
  const doc = await db.collection(ORDERS).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

export const getOrderByPayPalId = async (paypalOrderId) => {
  const snap = await db.collection(ORDERS).where('paypalOrderId', '==', paypalOrderId).limit(1).get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const updateOrder = async (id, data) => {
  const now = new Date().toISOString();
  await db.collection(ORDERS).doc(id).update({
    ...data,
    updatedAt: now
  });
  return await getOrderById(id);
};

export const getCustomerOrders = async (customerId) => {
  try {
    const snap = await db.collection(ORDERS).where('customerId', '==', customerId).get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("getCustomerOrders error:", err);
    return [];
  }
};

