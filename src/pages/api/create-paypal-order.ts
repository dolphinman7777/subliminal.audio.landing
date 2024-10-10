import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com'; // Use this for testing
// const PAYPAL_API_BASE = 'https://api-m.paypal.com'; // Use this for production

async function getAccessToken() {
  const auth = Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('PayPal token error:', errorData);
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, currency } = req.body;

  try {
    console.log('Attempting to get access token...');
    const accessToken = await getAccessToken();
    console.log('Access token received');

    const order = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount,
        },
      }],
      application_context: {
        return_url: `${req.headers.origin}/payment-success`,
        cancel_url: `${req.headers.origin}/studio`,
      },
    };

    console.log('Sending order creation request to PayPal...');
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(order),
    });

    const data = await response.json();
    console.log('PayPal API response:', data);

    if (response.ok) {
      const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href;
      res.status(200).json({ id: data.id, approvalUrl });
    } else {
      console.error('PayPal order creation failed:', data);
      throw new Error(data.message || 'Failed to create PayPal order');
    }
  } catch (error: unknown) {
    console.error('PayPal API Error:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to create PayPal order', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create PayPal order', details: 'An unknown error occurred' });
    }
  }
}