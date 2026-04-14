import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Fairway <onboarding@resend.dev>', to, subject, html })
  })
  return res.json()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { type, bidId, requestId } = await req.json()

    if (type === 'new_bid') {
      const { data: bid } = await supabase.from('bids').select('amount, vendor:profiles(full_name, org_name)').eq('id', bidId).single()
      const { data: request } = await supabase.from('requests').select('title, buyer_id').eq('id', requestId).single()
      const { data: { user } } = await supabase.auth.admin.getUserById(request.buyer_id)
      
      await sendEmail(
        user.email,
        `💰 New bid received on: ${request.title}`,
        `<h2>New bid received!</h2>
        <p><strong>${bid.vendor?.org_name || bid.vendor?.full_name}</strong> submitted a bid of <strong>$${Number(bid.amount).toLocaleString()}</strong> on your request: <strong>${request.title}</strong></p>
        <p><a href="https://fairwayprocurement.com/bids" style="background:#16a34a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:10px">Review bids →</a></p>
        <br/><p style="color:#666;font-size:12px">Fairway Procurement · fairwayprocurement.com</p>`
      )
    }

    if (type === 'bid_awarded') {
      const { data: bid } = await supabase.from('bids').select('amount, vendor_id, request:requests(title)').eq('id', bidId).single()
      const { data: { user } } = await supabase.auth.admin.getUserById(bid.vendor_id)
      
      await sendEmail(
        user.email,
        `🏆 You won a contract on Fairway!`,
        `<h2>Congratulations! You won a contract!</h2>
        <p>Your bid of <strong>$${Number(bid.amount).toLocaleString()}</strong> on <strong>${bid.request?.title}</strong> has been awarded!</p>
        <p><a href="https://fairwayprocurement.com/seller/dashboard" style="background:#16a34a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:10px">View contract →</a></p>
        <br/><p style="color:#666;font-size:12px">Fairway Procurement · fairwayprocurement.com</p>`
      )
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Email error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
