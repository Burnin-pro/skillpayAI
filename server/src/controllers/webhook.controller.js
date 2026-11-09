import pino from 'pino';
import * as orderRepository from '../repositories/orderRepository.js';
import * as jobRepository from '../repositories/jobRepository.js';

const logger = pino();

export const handlePayPalWebhook = async (req, res) => {
  const event = req.body;

  // In a real production app, verify the webhook signature here using PayPal's webhook verification API
  // or by verifying the signature headers with the Webhook ID.

  logger.info({ eventType: event.event_type }, 'Received PayPal webhook');

  try {
    if (event.event_type === 'CHECKOUT.ORDER.APPROVED' || event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const paypalOrderId = event.resource.id;
      
      const order = await orderRepository.getOrderByPayPalId(paypalOrderId);
      if (order && order.status === 'pending') {
        // Automatically capture or mark as paid
        await orderRepository.updateOrder(order.id, { status: 'paid' });
        await jobRepository.updateJob(order.jobId, { status: 'ordered' });
        logger.info(`Order ${order.id} marked as paid via webhook`);
      }
    }
  } catch (err) {
    logger.error({ err }, 'Webhook handling error');
  }

  // Always return 200 to acknowledge receipt
  res.status(200).send('OK');
};
