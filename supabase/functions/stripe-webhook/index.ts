import Stripe from 'https://esm.sh/stripe@14'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
const PLAN_MAP = { 'price_1TLoZpKSFMa1JWApWkk7Crnk': 'buyer_pro', 'price_1TLoccKSFMa1JWAp9wUEJ3yS': 'buyer_enterprise', 'price_1TLodfKSFMa1JWApkOIPigvv': 'vendor_pro' }
Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  let event
  try { event = stripe.webhooks.constructEvent(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')) } catch (err) { return new Response(`Webhook error: ${err.message}`, { status: 400 }) }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.user_id
    if (userId && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription)
      const priceId = subscription.items.data[0]?.price.id
      const planId = PLAN_MAP[priceId] || 'buyer_pro'
      await supabase.from('memberships').update({ plan_id: planId, status: 'active', stripe_subscription_id: session.subscription, renews_at: new Date(subscription.current_period_end * 1000).toISOString() }).eq('user_id', userId)
    }
  }
  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})
