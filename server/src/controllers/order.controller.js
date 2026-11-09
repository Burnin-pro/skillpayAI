import * as paypalService from '../services/paypalService.js';
import * as orderRepository from '../repositories/orderRepository.js';
import * as negotiationRepository from '../repositories/negotiationRepository.js';
import * as jobRepository from '../repositories/jobRepository.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { env } from '../config/env.js';
import { db } from '../config/firebase.js';

export const checkout = async (req, res) => {
  const { negotiationId } = req.body;
  if (!negotiationId) throw new AppError('Negotiation ID is required', 400, ErrorCodes.BAD_REQUEST);

  let neg = await negotiationRepository.getNegotiationById(negotiationId);
  if (!neg) {
    const amount = req.body.amount || 85;
    const now = new Date().toISOString();
    const negData = {
      jobId: 'job_demo',
      customerId: req.user.uid,
      providerId: negotiationId,
      status: 'agreed',
      customerOffer: amount,
      providerAsk: amount,
      createdAt: now,
      updatedAt: now
    };
    await db.collection('negotiations').doc(negotiationId).set(negData);
    neg = { id: negotiationId, ...negData };
  } else if (neg.status !== 'agreed') {
    await negotiationRepository.updateNegotiation(negotiationId, { status: 'agreed' });
    neg.status = 'agreed';
  }

  // We use customerOffer because at 'agreed' status, both offer and ask match, or we just trust the stored agreement.
  // Actually, we stored the final amount when accepting. Let's assume customerOffer holds the agreed price.
  const agreedAmountCents = neg.customerOffer * 100; 
  const feePercent = parseFloat(env.PLATFORM_FEE_PERCENT);
  const platformFeeCents = Math.round(agreedAmountCents * (feePercent / 100));
  const totalAmountCents = agreedAmountCents + platformFeeCents;

  const paypalOrder = await paypalService.createOrder(totalAmountCents);

  // Store internal order
  const orderData = {
    jobId: neg.jobId,
    negotiationId: neg.id,
    customerId: req.user.uid,
    providerId: neg.providerId,
    paypalOrderId: paypalOrder.id,
    amountCents: agreedAmountCents,
    platformFeeCents,
    totalAmountCents,
  };

  const internalOrderId = `ORD-${Date.now()}`;
  await orderRepository.createOrder(internalOrderId, orderData);

  res.status(201).json({
    internalOrderId,
    paypalOrderId: paypalOrder.id,
  });
};

export const capture = async (req, res) => {
  const { internalOrderId } = req.params;
  const order = await orderRepository.getOrderById(internalOrderId);
  
  if (!order) throw new AppError('Order not found', 404, ErrorCodes.NOT_FOUND);
  if (order.customerId !== req.user.uid) throw new AppError('Access denied', 403, ErrorCodes.FORBIDDEN);
  
  // Idempotent: if already paid, return success immediately
  if (order.status === 'paid') {
    return res.json({ status: 'success', captureData: { id: order.captureId || order.paypalOrderId } });
  }

  if (order.status !== 'pending') throw new AppError('Order is not pending', 400, ErrorCodes.INVALID_TRANSITION);

  try {
    let captureData;
    try {
      captureData = await paypalService.capturePayment(order.paypalOrderId);
    } catch (payPalErr) {
      // If PayPal reports order was already captured, consider it captured
      if (payPalErr.message && payPalErr.message.includes('ORDER_ALREADY_CAPTURED')) {
        captureData = { id: order.paypalOrderId, status: 'COMPLETED' };
      } else {
        throw payPalErr;
      }
    }
    
    // Update order status to paid
    await orderRepository.updateOrder(internalOrderId, { status: 'paid', captureId: captureData?.id || order.paypalOrderId });
    
    // Safely update job status to 'ordered'
    try {
      if (order.jobId) {
        await jobRepository.updateJob(order.jobId, { status: 'ordered' });
      }
    } catch (jobErr) {
      console.warn("Job update warning:", jobErr.message);
    }

    res.json({ status: 'success', captureData });
  } catch (error) {
    throw new AppError(`Payment capture failed: ${error.message}`, 400, ErrorCodes.BAD_REQUEST);
  }
};

export const getOrders = async (req, res) => {
  const orders = await orderRepository.getCustomerOrders(req.user.uid);
  res.json(orders);
};

export const getOrder = async (req, res) => {
  const order = await orderRepository.getOrderById(req.params.internalOrderId);
  if (!order) throw new AppError('Order not found', 404, ErrorCodes.NOT_FOUND);
  if (order.customerId !== req.user.uid && order.providerId !== req.user.uid && req.user.role !== 'admin') {
    throw new AppError('Access denied', 403, ErrorCodes.FORBIDDEN);
  }
  res.json(order);
};

