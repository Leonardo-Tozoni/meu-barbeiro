'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/app/_lib/prisma';
import { stripe } from '@/app/_lib/stripe';
import { authOptions } from '@/app/_lib/auth';
import { getServerSession } from 'next-auth';

export async function createCheckoutSession() {
  try {
    console.log('[ACTION] Creating checkout session...');
    const session = await getServerSession(authOptions);
    console.log('[ACTION] Session retrieved:', session?.user ? 'User found' : 'No user');

    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const user = session.user as any;

    if (user.role !== 'BARBER') {
      return {
        success: false,
        error: 'Only barbers can create subscriptions'
      };
    }

    if (!user.barbershopId) {
      return {
        success: false,
        error: 'Barber must be linked to a barbershop'
      };
    }

    console.log('[ACTION] Fetching barber from database...');
    const barber = await db.barber.findUnique({
      where: { userId: user.id },
      include: { subscription: true },
    });

    if (!barber) {
      return {
        success: false,
        error: 'Barber not found'
      };
    }

    if (barber.subscription && barber.subscription.status === 'active') {
      return {
        success: false,
        error: 'Barber already has an active subscription'
      };
    }

    console.log('[ACTION] Fetching active plan...');
    const plan = await db.plan.findFirst({
      where: { active: true },
    });

    if (!plan) {
      return {
        success: false,
        error: 'No active plan available'
      };
    }

    let customerId: string;

    if (barber.subscription?.stripeCustomerId) {
      customerId = barber.subscription.stripeCustomerId;
      console.log('[ACTION] Using existing customer:', customerId);
    } else {
      console.log('[ACTION] Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
          barberId: barber.id,
        },
      });
      customerId = customer.id;
      console.log('[ACTION] Customer created:', customerId);
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log('[ACTION] Creating Stripe checkout session with plan:', plan.stripePriceId);
    
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription?canceled=true`,
      metadata: {
        barberId: barber.id,
        planId: plan.id,
      },
    });

    console.log('[ACTION] Checkout session created:', checkoutSession.id);
    console.log('[ACTION] Checkout URL:', checkoutSession.url);

    return {
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    };
  } catch (error: any) {
    console.error('[ACTION] Exception:', error);
    return {
      success: false,
      error: error.message || 'Failed to create checkout session'
    };
  }
}

export async function getSubscriptionStatus() {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      }/api/subscriptions/status`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to get subscription status'
      };
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Error getting subscription status:', error);
    return {
      success: false,
      error: error.message || 'Failed to get subscription status'
    };
  }
}

export async function cancelSubscription() {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      }/api/subscriptions/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Failed to cancel subscription'
      };
    }

    const data = await response.json();
    revalidatePath('/subscription');
    revalidatePath('/barber-dashboard');

    return {
      success: true,
      message: data.message
    };
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel subscription'
    };
  }
}
