import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export const getStripePublishableKey = () => {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
};

export const formatAmountForStripe = (amount: number): number => {
  // Stripe expects amounts in cents (smallest currency unit)
  // For BRL, we multiply by 100
  return Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount: number): number => {
  // Convert from cents to reais
  return amount / 100;
};

