import { db } from '../config/firebase.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

export const getDashboardData = async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Admin access required', 403, ErrorCodes.FORBIDDEN);
  }

  // KPIs
  const usersCountSnap = await db.collection('users').count().get();
  const ordersCountSnap = await db.collection('orders').count().get();
  
  // Aggregate Payment Volume (In a real production system, use cloud functions to maintain aggregates)
  let paymentVolume = 0;
  const ordersSnap = await db.collection('orders').get();
  ordersSnap.forEach(doc => {
    const data = doc.data();
    if (data.status === 'paid' || data.status === 'completed' || data.status === 'released') {
      paymentVolume += data.totalAmountCents || 0;
    }
  });

  const kpis = {
    totalUsers: usersCountSnap.data().count,
    activeOrders: ordersCountSnap.data().count,
    paymentVolume: `$${(paymentVolume / 100).toFixed(2)}`,
    systemHealth: '99.9%'
  };

  // Recent Users
  const recentUsersSnap = await db.collection('users').orderBy('createdAt', 'desc').limit(5).get();
  const recentUsers = recentUsersSnap.docs.map(d => {
    const data = d.data();
    return {
      email: data.email,
      role: data.role,
      status: 'Active'
    };
  });

  // Recent Transactions
  const recentOrdersSnap = await db.collection('orders').orderBy('createdAt', 'desc').limit(5).get();
  const recentOrders = recentOrdersSnap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      amount: `$${((data.totalAmountCents || 0) / 100).toFixed(2)}`,
      status: data.status
    };
  });

  res.json({
    kpis,
    recentUsers,
    recentOrders
  });
};
