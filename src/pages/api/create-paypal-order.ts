import { NextApiRequest, NextApiResponse } from 'next';
import paypal from '@paypal/checkout-server-sdk';

// Configure PayPal environment
let clientId = process.env.PAYPAL_CLIENT_ID;
let clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('PayPal credentials are not set in environment variables');
}

let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
let client = new paypal.core.PayPalHttpClient(environment);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('Received request to create PayPal order');
      const { amount, currency } = req.body;
      console.log('Order details:', { amount, currency });

      let request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toString()
          }
        }],
        application_context: {
          return_url: `${req.headers.origin}/success`,
          cancel_url: `${req.headers.origin}/studio`,
        }
      });

      console.log('Sending request to PayPal');
      const response = await client.execute(request);
      console.log('Received response from PayPal:', response);

      if (response.statusCode !== 201) {
        console.error('Unexpected status code from PayPal:', response.statusCode);
        throw new Error('Failed to create PayPal order');
      }

      // Find the approval URL
      const approvalUrl = response.result.links.find(link => link.rel === "approve")?.href;
      if (!approvalUrl) {
        console.error('No approval URL found in PayPal response');
        throw new Error('No approval URL in PayPal response');
      }

      console.log('Sending approval URL to client:', approvalUrl);
      res.status(200).json({ approvalUrl });
    } catch (err: any) {
      console.error('Error in PayPal order creation:', err);
      res.status(500).json({ statusCode: 500, message: err.message, stack: err.stack });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}