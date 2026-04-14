import Stripe from 'https://esm.sh/stripe@14'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { priceId, userId, email, planName } = await req.json()
    const { data: membership } = await supabase.from('memberships').select('stripe_customer_id').eq('user_id', userId).single()
    let customerId = membership?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { supabase_user_id: userId } })
      customerId = customer.id
      await supabase.from('memberships').update({ stripe_customer_id: customerId }).eq('user_id', userId)
    }
    const session = await stripe.checkout.sessions.create({ customer: customerId, payment_method_types: ['card'], line_items: [{ price: priceId, quantity: 1 }], mode: 'subscription', success_url: `${Deno.env.get('APP_URL')}/settings?upgraded=true`, cancel_url: `${Deno.env.get('APP_URL')}/pricing`, metadata: { user_id: userId, plan_name: planName } })
    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
