import { authOptions } from '@/app/_lib/auth';
import { db } from '@/app/_lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;

    if (user.role !== 'BARBER') {
      return NextResponse.json(
        { error: 'Only barbers can check subscription status' },
        { status: 403 }
      );
    }

    // Get the barber record with subscription and plan
    const barber = await db.barber.findUnique({
      where: { userId: user.id },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!barber) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }

    if (!barber.subscription) {
      return NextResponse.json({
        hasSubscription: false
      });
    }

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: barber.subscription.id,
        status: barber.subscription.status,
        currentPeriodStart: barber.subscription.currentPeriodStart,
        currentPeriodEnd: barber.subscription.currentPeriodEnd,
        cancelAtPeriodEnd: barber.subscription.cancelAtPeriodEnd,
        plan: {
          id: barber.subscription.plan.id,
          name: barber.subscription.plan.name,
          description: barber.subscription.plan.description,
          price: barber.subscription.plan.price.toString()
        }
      }
    });
  } catch (error: any) {
    console.error('Error getting subscription status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
