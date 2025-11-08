// src/app/api/payments/create-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tier } = await req.json();

  // Get live price IDs from Stripe dashboard
  const premiumPriceId = 'price_1S4Y...'; // REPLACE with your real Premium price ID
  const orgPriceId = 'price_1S4Z...';    // REPLACE with your real Org price ID

  const priceId = tier === 'premium' ? premiumPriceId : orgPriceId;

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    client_reference_id: session.userId,
    success_url: `${process.env.RENDER_PUBLIC_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.RENDER_PUBLIC_URL}/settings/billing`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
