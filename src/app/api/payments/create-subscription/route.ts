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

  let priceData;
  if (tier === 'premium') {
    priceData = {
      currency: 'gbp',
      unit_amount: 850, // £8.50 = 850 pence
      recurring: { interval: 'month' as const },
      product_data: {
        name: 'UnfilteredUK Premium',
        description: 'Blue verification, no ads, no tracking',
      },
    };
  } else if (tier === 'org') {
    priceData = {
      currency: 'gbp',
      unit_amount: 2500, // £25.00 = 2500 pence
      recurring: { interval: 'month' as const },
      product_data: {
        name: 'UnfilteredUK Organisation',
        description: 'Org badge, affiliates, analytics, subdomain',
      },
    };
  } else {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price_data: priceData, quantity: 1 }],
      client_reference_id: session.userId,
      success_url: `${process.env.RENDER_PUBLIC_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.RENDER_PUBLIC_URL}/settings/billing`,
      subscription_data: {
        metadata: { userId: session.userId, tier },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: 'Payment setup failed' }, { status: 500 });
  }
}
