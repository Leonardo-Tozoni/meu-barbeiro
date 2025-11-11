import { db } from '@/app/_lib/prisma';
import { stripe } from '@/app/_lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Disable body parsing for webhook route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log('Webhook received');

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  console.log('Signature:', signature ? 'present' : 'missing');
  console.log('Body length:', body.length);

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('Webhook event type:', event.type);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    console.log('Processing event:', event.type);
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );

          const barberId = session.metadata?.barberId;
          const planId = session.metadata?.planId;

          if (!barberId || !planId) {
            console.error('Missing metadata in checkout session');
            break;
          }

          // Create or update subscription in database
          await db.subscription.upsert({
            where: { barberId },
            update: {
              stripeSubscriptionId: subscription.id,
              stripeCustomerId:
                typeof subscription.customer === 'string'
                  ? subscription.customer
                  : subscription.customer.id,
              status: subscription.status,
              currentPeriodStart: new Date(
                (subscription as any).current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                (subscription as any).current_period_end * 1000
              ),
              cancelAtPeriodEnd:
                (subscription as any).cancel_at_period_end || false,
              canceledAt: (subscription as any).canceled_at
                ? new Date((subscription as any).canceled_at * 1000)
                : null
            },
            create: {
              barberId,
              planId,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId:
                typeof subscription.customer === 'string'
                  ? subscription.customer
                  : subscription.customer.id,
              status: subscription.status,
              currentPeriodStart: new Date(
                (subscription as any).current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                (subscription as any).current_period_end * 1000
              ),
              cancelAtPeriodEnd:
                (subscription as any).cancel_at_period_end || false,
              canceledAt: (subscription as any).canceled_at
                ? new Date((subscription as any).canceled_at * 1000)
                : null
            }
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        const dbSubscription = await db.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id }
        });

        if (dbSubscription) {
          await db.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              status: subscription.status,
              currentPeriodStart: new Date(
                (subscription as any).current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                (subscription as any).current_period_end * 1000
              ),
              cancelAtPeriodEnd:
                (subscription as any).cancel_at_period_end || false,
              canceledAt: (subscription as any).canceled_at
                ? new Date((subscription as any).canceled_at * 1000)
                : null
            }
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const dbSubscription = await db.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id }
        });

        if (dbSubscription) {
          await db.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              status: 'canceled',
              canceledAt: new Date()
            }
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        const subscriptionId = (invoice as any).subscription as string | null;

        if (subscriptionId) {
          const dbSubscription = await db.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId }
          });

          const paymentIntentId = (invoice as any).payment_intent as
            | string
            | null;

          if (dbSubscription && paymentIntentId) {
            await db.payment.create({
              data: {
                subscriptionId: dbSubscription.id,
                stripePaymentIntentId: paymentIntentId,
                amount: (invoice.amount_paid || 0) / 100, // Convert from cents
                status: 'succeeded',
                paidAt: new Date()
              }
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        const subscriptionId = (invoice as any).subscription as string | null;

        if (subscriptionId) {
          const dbSubscription = await db.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId }
          });

          if (dbSubscription) {
            await db.subscription.update({
              where: { id: dbSubscription.id },
              data: {
                status: 'past_due'
              }
            });

            const paymentIntentId = (invoice as any).payment_intent as
              | string
              | null;

            if (paymentIntentId) {
              await db.payment.create({
                data: {
                  subscriptionId: dbSubscription.id,
                  stripePaymentIntentId: paymentIntentId,
                  amount: (invoice.amount_due || 0) / 100, // Convert from cents
                  status: 'failed'
                }
              });
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
