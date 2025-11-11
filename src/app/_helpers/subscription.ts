import { db } from '@/app/_lib/prisma';

export async function hasActiveSubscription(barberId: string): Promise<boolean> {
  try {
    const barber = await db.barber.findUnique({
      where: { id: barberId },
      include: { subscription: true },
    });

    if (!barber || !barber.subscription) {
      return false;
    }

    const subscription = barber.subscription;

    // Check if subscription is active and not canceled
    if (subscription.status === 'active' && !subscription.cancelAtPeriodEnd) {
      // Also check if current period hasn't ended
      const now = new Date();
      if (subscription.currentPeriodEnd > now) {
        return true;
      }
    }

    // If canceled at period end, check if still within current period
    if (subscription.status === 'active' && subscription.cancelAtPeriodEnd) {
      const now = new Date();
      if (subscription.currentPeriodEnd > now) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

export async function getSubscriptionForBarber(barberId: string) {
  try {
    const barber = await db.barber.findUnique({
      where: { id: barberId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    return barber?.subscription || null;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

