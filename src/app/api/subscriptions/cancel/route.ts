import { authOptions } from '@/app/_lib/auth';
import { db } from '@/app/_lib/prisma';
import { stripe } from '@/app/_lib/stripe';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;

    if (user.role !== 'BARBER') {
      return NextResponse.json(
        { error: 'Only barbers can cancel subscriptions' },
        { status: 403 }
      );
    }

    // Get the barber record with subscription
    const barber = await db.barber.findUnique({
      where: { userId: user.id },
      include: { subscription: true }
    });

    if (!barber) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }

    if (!barber.subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    if (barber.subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      );
    }

    // Cancel subscription at period end in Stripe
    await stripe.subscriptions.update(
      barber.subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true
      }
    );

    // Update subscription in database
    await db.subscription.update({
      where: { id: barber.subscription.id },
      data: {
        cancelAtPeriodEnd: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period'
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
