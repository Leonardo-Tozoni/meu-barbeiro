import { authOptions } from '@/app/_lib/auth';
import { db } from '@/app/_lib/prisma';
import { stripe } from '@/app/_lib/stripe';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('[1/8] Creating checkout session...');
    const session = await getServerSession(authOptions);
    console.log(
      '[2/8] Session retrieved:',
      session?.user ? 'User found' : 'No user'
    );

    if (!session?.user) {
      console.log('[ERROR] No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    console.log('[3/8] User role:', user.role);

    if (user.role !== 'BARBER') {
      console.log('[ERROR] User is not a barber');
      return NextResponse.json(
        { error: 'Only barbers can create subscriptions' },
        { status: 403 }
      );
    }

    if (!user.barbershopId) {
      console.log('[ERROR] User has no barbershop');
      return NextResponse.json(
        { error: 'Barber must be linked to a barbershop' },
        { status: 400 }
      );
    }

    console.log('[4/8] Fetching barber from database...');
    // Get the barber record
    const barber = await db.barber.findUnique({
      where: { userId: user.id },
      include: { subscription: true }
    });
    console.log('[5/8] Barber found:', barber ? 'Yes' : 'No');

    if (!barber) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }

    // Check if already has active subscription
    if (barber.subscription && barber.subscription.status === 'active') {
      console.log('[ERROR] Barber already has active subscription');
      return NextResponse.json(
        { error: 'Barber already has an active subscription' },
        { status: 400 }
      );
    }

    console.log('[6/8] Fetching active plan...');
    // Get the active plan
    const plan = await db.plan.findFirst({
      where: { active: true }
    });
    console.log('[7/8] Plan found:', plan ? plan.name : 'No plan');

    if (!plan) {
      return NextResponse.json(
        { error: 'No active plan available' },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let customerId: string;

    if (barber.subscription?.stripeCustomerId) {
      customerId = barber.subscription.stripeCustomerId;
      console.log('[8/8] Using existing customer:', customerId);
    } else {
      console.log('[8/8] Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
          barberId: barber.id
        }
      });
      customerId = customer.id;
      console.log('[8/8] Customer created:', customerId);
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log(
      'Creating Stripe checkout session with plan:',
      plan.stripePriceId
    );

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1
        }
      ],
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription?canceled=true`,
      metadata: {
        barberId: barber.id,
        planId: plan.id
      }
    });

    console.log('Checkout session created:', checkoutSession.id);
    console.log('Checkout URL:', checkoutSession.url);

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
