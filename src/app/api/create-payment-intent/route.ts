import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    console.log('Received request to create payment intent');
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    console.log('Origin:', origin);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Affirmation Audio',
            },
            unit_amount: 300, // €3.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
    });

    console.log('Stripe session created:', session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Detailed error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session', details: error.message }, { status: 500 });
  }
}