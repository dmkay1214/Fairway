import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
)

Deno.serve(async (req) => {
  const { record } = await req.json()
  const user = record

  try {
    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        role: user.raw_user_meta_data?.role || 'buyer',
        full_name: user.raw_user_meta_data?.full_name || '',
        org_name: user.raw_user_meta_data?.org_name || '',
        location: user.raw_user_meta_data?.location || '',
        categories: user.raw_user_meta_data?.categories || [],
        verified: false,
        rating: 0,
        review_count: 0,
        bids_won: 0,
        total_revenue: 0,
      })

    if (profileError) throw profileError

    // Create free membership
    const role = user.raw_user_meta_data?.role || 'buyer'
    const { error: memberError } = await supabaseAdmin
      .from('memberships')
      .upsert({
        user_id: user.id,
        plan_id: role === 'buyer' ? 'buyer_free' : 'vendor_free',
        status: 'active',
        requests_used_this_month: 0,
        bids_used_this_month: 0,
        renews_at: null,
      })

    if (memberError) console.error('Membership error:', memberError)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
