import Stripe from 'https://esm.sh/stripe@14'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const body = await req.json()
    console.log('Request body:', JSON.stringify(body))
    const { bidId, requestId, buyerEmail } = body

    const { data: bid, error: bidError } = await supabase.from('bids').select('*, vendor:profiles(stripe_account_id, full_name, org_name)').eq('id', bidId).single()
    console.log('Bid:', JSON.stringify(bid), 'Error:', bidError)

    const { data: request, error: reqError } = await supabase.from('requests').select('title, budget').eq('id', requestId).single()
    console.log('Request:', JSON.stringify(request), 'Error:', reqError)

    if (!bid) throw new Error('Bid not found: ' + bidError?.message)
    if (!request) throw new Error('Request not found: ' + reqError?.message)
    if (!bid.vendor?.stripe_account_id) throw new Error('Vendor stripe_account_id is null for vendor: ' + bid.vendor_id)

    const amount = Math.round(bid.amount * 100)
    const platformFee = Math.round(amount * 0.05)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: request.title,
              description: `Vendor: ${bid.vendor?.org_name || bid.vendor?.full_name || 'Vendor'} · Fulfilled via Fairway Procurement`,
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${Deno.env.get('APP_URL')}/bids?payment=success&bid=${bidId}&req=${requestId}`,
      cancel_url: `${Deno.env.get('APP_URL')}/bids?req=${requestId}`,
      customer_email: buyerEmail,
      payment_intent_data: { application_fee_amount: platformFee, transfer_data: { destination: bid.vendor.stripe_account_id } },
      metadata: { bid_id: bidId, request_id: requestId },
    })

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
