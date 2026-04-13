// ============================================================
// STRIPE CONNECT INTEGRATION
// ============================================================
// Fairway uses Stripe Connect (Express accounts) so vendors
// get paid directly and the platform takes a % cut automatically.
//
// Flow:
//   1. Vendor onboards → Stripe Express account created
//   2. Buyer awards bid → payment intent created
//   3. Buyer pays → funds split: vendor gets (amount - fee), platform gets fee
//   4. Stripe handles payouts to vendor's bank automatically
// ============================================================

// ─── Frontend: load Stripe ────────────────────────────────────
import { loadStripe } from '@stripe/stripe-js'

let stripePromise = null

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

// ─── Frontend: redirect to Stripe checkout ────────────────────
export async function initiatePayment({ orderId, amount, vendorStripeAccountId }) {
  const platformFeePct = Number(import.meta.env.VITE_PLATFORM_FEE_PCT || 3)
  const platformFee = Math.round(amount * platformFeePct / 100 * 100) // in cents

  // Call your backend/edge function to create a PaymentIntent
  const res = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      amount: Math.round(amount * 100), // cents
      vendorStripeAccountId,
      applicationFeeAmount: platformFee,
    }),
  })

  const { clientSecret, error } = await res.json()
  if (error) throw new Error(error)

  const stripe = await getStripe()
  const result = await stripe.confirmPayment({
    clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/orders?payment=success`,
    },
  })

  if (result.error) throw new Error(result.error.message)
  return result
}

// ─── Supabase Edge Function: create-payment-intent ────────────
// Deploy this to: supabase/functions/create-payment-intent/index.ts
//
// import Stripe from 'https://esm.sh/stripe@14'
// import { serve } from 'https://deno.land/std/http/server.ts'
//
// serve(async (req) => {
//   const { orderId, amount, vendorStripeAccountId, applicationFeeAmount } = await req.json()
//   const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))
//
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount,
//     currency: 'usd',
//     application_fee_amount: applicationFeeAmount,
//     transfer_data: { destination: vendorStripeAccountId },
//     metadata: { orderId },
//   })
//
//   return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }))
// })

// ─── Vendor onboarding: create Stripe Express account ─────────
// Also deploy as a Supabase Edge Function:
//
// const account = await stripe.accounts.create({ type: 'express' })
// const link = await stripe.accountLinks.create({
//   account: account.id,
//   refresh_url: `${APP_URL}/seller/profile?stripe=refresh`,
//   return_url:  `${APP_URL}/seller/profile?stripe=success`,
//   type: 'account_onboarding',
// })
// → Redirect vendor to link.url
// → On return, save account.id to profiles.stripe_account_id

export const STRIPE_DOCS = {
  connect: 'https://stripe.com/docs/connect/express-accounts',
  paymentIntents: 'https://stripe.com/docs/payments/payment-intents',
  webhooks: 'https://stripe.com/docs/webhooks',
}
