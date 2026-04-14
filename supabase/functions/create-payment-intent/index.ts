import Stripe from 'https://esm.sh/stripe@14'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { bidId, requestId, buyerEmail } = await req.json()

    const { data: bid } = await supabase.from('bids').select('*, vendor:profiles(stripe_account_id, full_name, org_name)').eq('id', bidId).single()
    const { data: request } = await supabase.from('requests').select('title, budget').eq('id', requestId).single()

    if (!bid.vendor.stripe_account_id) throw new Error('Vendor has not connected their Stripe account yet')

    const amount = Math.round(bid.amount * 100) // convert to cents
    const platformFee = Math.round(amount * 0.03) // 3% platform fee

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: request.title, description: `Bid from ${bid.vendor.org_name || bid.vendor.full_name}` },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${Deno.env.get('APP_URL')}/bids?payment=success&bid=${bidId}&req=${requestId}`,
      cancel_url: `${Deno.env.get('APP_URL')}/bids?req=${requestId}`,
      customer_email: buyerEmail,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: { destination: bid.vendor.stripe_account_id },
      },
      metadata: { bid_id: bidId, request_id: requestId },
    })

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
