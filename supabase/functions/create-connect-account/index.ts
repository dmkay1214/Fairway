import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { userId, email } = await req.json()
    const account = await stripe.accounts.create({ type: 'express', email, metadata: { supabase_user_id: userId } })
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${Deno.env.get('APP_URL')}/seller/profile?connect=refresh`,
      return_url: `${Deno.env.get('APP_URL')}/seller/profile?connect=success`,
      type: 'account_onboarding',
    })
    return new Response(JSON.stringify({ url: accountLink.url, accountId: account.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
