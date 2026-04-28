import Stripe from 'https://esm.sh/stripe@14'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SERVICE_ROLE_KEY'))

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  let event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET'))
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return new Response('Webhook Error', { status: 400 })
  }

  console.log('Event type:', event.type)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const bidId = session.metadata?.bid_id
    const requestId = session.metadata?.request_id

    if (bidId && requestId) {
      // Update order status to paid
      await supabase.from('orders').update({ status: 'paid' }).eq('bid_id', bidId)
      
      // Send email to vendor confirming payment
      await supabase.functions.invoke('send-email', {
        body: { type: 'bid_awarded', bidId, requestId }
      })

      // Get order ID and send introduction emails to both buyer and vendor
      const { data: order } = await supabase.from('orders').select('id').eq('bid_id', bidId).single()
      if (order?.id) {
        await supabase.functions.invoke('send-email', {
          body: { type: 'order_introduction', requestId: order.id }
        })
      }

      console.log('Order marked as paid for bid:', bidId)
    }
  }

  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})
