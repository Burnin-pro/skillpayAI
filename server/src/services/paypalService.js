import { env } from '../config/env.js';

const base = env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

const generateAccessToken = async () => {
  const auth = Buffer.from(env.PAYPAL_CLIENT_ID + ':' + env.PAYPAL_CLIENT_SECRET).toString('base64');
  
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error('Failed to generate PayPal access token: ' + JSON.stringify(data));
  }
  return data.access_token;
};

export const createOrder = async (amountCents) => {
  const accessToken = await generateAccessToken();
  const amount = (amountCents / 100).toFixed(2); // Convert cents to string dollars
  
  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: amount,
        },
      },
    ],
  };

  const response = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const capturePayment = async (orderId) => {
  const accessToken = await generateAccessToken();
  
  const response = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleResponse(response);
};

async function handleResponse(response) {
  const jsonResponse = await response.json();
  if (!response.ok) {
    throw new Error(jsonResponse.message || 'PayPal API Error');
  }
  return jsonResponse;
}
