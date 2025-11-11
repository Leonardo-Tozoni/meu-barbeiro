import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover'
});

async function setupStripePlan() {
  try {
    // Configuration - adjust these values as needed
    const planName = 'Plano Mensal';
    const planDescription = 'Assinatura mensal para barbeiros';
    const planPrice = 29.9; // Price in BRL

    console.log('🚀 Setting up Stripe plan...\n');

    // Check if plan already exists in database
    const existingPlan = await prisma.plan.findFirst({
      where: { active: true }
    });

    if (existingPlan) {
      console.log('⚠️  An active plan already exists in the database:');
      console.log(`   Name: ${existingPlan.name}`);
      console.log(`   Price: R$ ${existingPlan.price}`);
      console.log(`   Stripe Price ID: ${existingPlan.stripePriceId}\n`);
      console.log(
        'ℹ️  The existing plan will be deactivated and a new one will be created.\n'
      );
    }

    // Create product in Stripe
    console.log('📦 Creating product in Stripe...');
    const product = await stripe.products.create({
      name: planName,
      description: planDescription
    });
    console.log(`✅ Product created: ${product.id}\n`);

    // Create price in Stripe (monthly recurring)
    console.log('💰 Creating price in Stripe...');
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(planPrice * 100), // Convert to cents
      currency: 'brl',
      recurring: {
        interval: 'month'
      }
    });
    console.log(`✅ Price created: ${price.id}\n`);

    // Deactivate existing plans
    if (existingPlan) {
      await prisma.plan.updateMany({
        where: { active: true },
        data: { active: false }
      });
      console.log('✅ Existing plans deactivated\n');
    }

    // Create plan in database
    console.log('💾 Saving plan to database...');
    const plan = await prisma.plan.create({
      data: {
        name: planName,
        description: planDescription,
        price: planPrice,
        stripePriceId: price.id,
        stripeProductId: product.id,
        active: true
      }
    });
    console.log(`✅ Plan saved to database: ${plan.id}\n`);

    console.log('✨ Setup completed successfully!\n');
    console.log('Plan Details:');
    console.log(`  Name: ${plan.name}`);
    console.log(`  Description: ${plan.description}`);
    console.log(`  Price: R$ ${plan.price}/month`);
    console.log(`  Stripe Product ID: ${plan.stripeProductId}`);
    console.log(`  Stripe Price ID: ${plan.stripePriceId}`);
    console.log(`  Database ID: ${plan.id}\n`);

    console.log('📝 Next steps:');
    console.log(
      '  1. Make sure STRIPE_WEBHOOK_SECRET is set in your .env file'
    );
    console.log('  2. Configure webhook endpoint in Stripe Dashboard:');
    console.log(
      `     URL: ${
        process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
      }/api/subscriptions/webhook`
    );
    console.log('     Events to listen:');
    console.log('       - checkout.session.completed');
    console.log('       - customer.subscription.updated');
    console.log('       - customer.subscription.deleted');
    console.log('       - invoice.payment_succeeded');
    console.log('       - invoice.payment_failed');
  } catch (error) {
    console.error('❌ Error setting up Stripe plan:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupStripePlan()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
