import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SERVICE_ROLE_KEY'))

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Fairway <notifications@fairwayprocurement.com>', to, subject, html })
  })
  const data = await res.json()
  console.log('Resend response:', JSON.stringify(data))
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { type, bidId, requestId, to, name } = await req.json()
    console.log('Email type:', type, 'bidId:', bidId, 'requestId:', requestId)

    if (type === 'welcome_buyer') {
      await sendEmail(
        to,
        'Welcome to Fairway Procurement! 🏌️',
        `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 48px; margin-bottom: 8px;">⛳</div>
            <h1 style="font-size: 24px; color: #0a2e1f; margin: 0;">Welcome to Fairway!</h1>
          </div>
          <p style="font-size: 15px; color: #444; line-height: 1.7;">Hi ${name},</p>
          <p style="font-size: 15px; color: #444; line-height: 1.7;">You're now part of the golf industry's premier procurement marketplace. Here's how to get started:</p>
          <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
              <span style="font-size: 20px; margin-right: 12px;">📋</span>
              <div><strong>Post a request</strong><br/><span style="color: #666; font-size: 13px;">Tell vendors what you need — sand, fertilizer, equipment, labor, and more</span></div>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
              <span style="font-size: 20px; margin-right: 12px;">⚡</span>
              <div><strong>Receive competing bids</strong><br/><span style="color: #666; font-size: 13px;">Vendors compete for your business, driving prices down</span></div>
            </div>
            <div style="display: flex; align-items: flex-start;">
              <span style="font-size: 20px; margin-right: 12px;">💰</span>
              <div><strong>Save money</strong><br/><span style="color: #666; font-size: 13px;">Clubs save an average of 18% on procurement costs</span></div>
            </div>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://fairwayprocurement.com/requests" style="background: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Post your first request →</a>
          </div>
          <p style="font-size: 13px; color: #999; text-align: center;">Questions? Reply to this email and we'll help you get started.</p>
          <p style="font-size: 13px; color: #999; text-align: center;">— The Fairway Team</p>
        </div>`
      )
    }

    if (type === 'welcome_vendor') {
      await sendEmail(
        to,
        'Welcome to Fairway — Start winning contracts! 🏆',
        `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 48px; margin-bottom: 8px;">⛳</div>
            <h1 style="font-size: 24px; color: #0a2e1f; margin: 0;">Welcome to Fairway!</h1>
          </div>
          <p style="font-size: 15px; color: #444; line-height: 1.7;">Hi ${name},</p>
          <p style="font-size: 15px; color: #444; line-height: 1.7;">You've joined the marketplace where golf clubs come to find vendors like you. Here's how to start winning contracts:</p>
          <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
              <span style="font-size: 20px; margin-right: 12px;">👤</span>
              <div><strong>Complete your profile</strong><br/><span style="color: #666; font-size: 13px;">Add your company name, location and service categories</span></div>
            </div>
            <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
              <span style="font-size: 20px; margin-right: 12px;">⚡</span>
              <div><strong>Connect Stripe</strong><br/><span style="color: #666; font-size: 13px;">Required to receive payments when you win contracts</span></div>
            </div>
            <div style="display: flex; align-items: flex-start;">
              <span style="font-size: 20px; margin-right: 12px;">🔍</span>
              <div><strong>Browse open requests</strong><br/><span style="color: #666; font-size: 13px;">Submit bids on procurement requests from golf clubs near you</span></div>
            </div>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://fairwayprocurement.com/seller" style="background: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Browse open requests →</a>
          </div>
          <p style="font-size: 13px; color: #999; text-align: center;">Questions? Reply to this email and we'll help you get started.</p>
          <p style="font-size: 13px; color: #999; text-align: center;">— The Fairway Team</p>
        </div>`
      )
    }

    if (type === 'new_bid') {
      const { data: bid } = await supabase.from('bids').select('amount, vendor:profiles(full_name, org_name)').eq('id', bidId).single()
      const { data: request } = await supabase.from('requests').select('title, buyer_id').eq('id', requestId).single()
      const { data: { user } } = await supabase.auth.admin.getUserById(request.buyer_id)
      console.log('Sending to buyer:', user.email)
      await sendEmail(
        user.email,
        `New bid received on: ${request.title}`,
        `<h2>New bid received!</h2><p><strong>${bid.vendor?.org_name || bid.vendor?.full_name}</strong> submitted a bid of <strong>$${Number(bid.amount).toLocaleString()}</strong> on: <strong>${request.title}</strong></p><p><a href="https://fairwayprocurement.com/bids">Review bids →</a></p>`
      )
    }

    if (type === 'bid_awarded') {
      const { data: bid } = await supabase.from('bids').select('amount, vendor_id, request:requests(title)').eq('id', bidId).single()
      const { data: { user } } = await supabase.auth.admin.getUserById(bid.vendor_id)
      console.log('Sending to vendor:', user.email)
      await sendEmail(
        user.email,
        `You won a contract on Fairway!`,
        `<h2>Congratulations! You won a contract!</h2><p>Your bid of <strong>$${Number(bid.amount).toLocaleString()}</strong> on <strong>${bid.request?.title}</strong> has been awarded!</p><p><a href="https://fairwayprocurement.com/seller/dashboard">View contract →</a></p>`
      )
    }

    if (type === 'order_introduction') {
      const { data: order } = await supabase.from('orders')
        .select('*, request:requests(title, buyer:profiles(full_name, org_name, phone, contact_email)), bid:bids(amount, vendor:profiles(full_name, org_name, phone, contact_email))')
        .eq('id', requestId)
        .single()

      const buyerName = order?.request?.buyer?.org_name || order?.request?.buyer?.full_name || 'The Club'
      const vendorName = order?.bid?.vendor?.org_name || order?.bid?.vendor?.full_name || 'The Vendor'
      const orderTitle = order?.request?.title || 'your order'
      const amount = Number(order?.bid?.amount || 0).toLocaleString()

      // Email to buyer
      const buyerEmail = order?.request?.buyer?.contact_email
      if (buyerEmail) {
        await sendEmail(
          buyerEmail,
          `Your vendor contact for: ${orderTitle}`,
          `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 48px; margin-bottom: 8px;">⛳</div>
              <h1 style="font-size: 22px; color: #0a2e1f; margin: 0;">Your order is confirmed!</h1>
            </div>
            <p style="font-size: 15px; color: #444; line-height: 1.7;">Hi ${buyerName},</p>
            <p style="font-size: 15px; color: #444; line-height: 1.7;">Your bid has been awarded and payment confirmed for <strong>${orderTitle}</strong>. Here is your vendor contact to coordinate delivery and logistics:</p>
            <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h2 style="font-size: 16px; color: #0a2e1f; margin: 0 0 16px 0;">Vendor Details</h2>
              <p style="margin: 8px 0; font-size: 14px; color: #444;"><strong>Company:</strong> ${vendorName}</p>
              ${order?.bid?.vendor?.phone ? `<p style="margin: 8px 0; font-size: 14px; color: #444;"><strong>Phone:</strong> <a href="tel:${order.bid.vendor.phone}" style="color: #16a34a;">${order.bid.vendor.phone}</a></p>` : ''}
              ${order?.bid?.vendor?.contact_email ? `<p style="margin: 8px 0; font-size: 14px; color: #444;"><strong>Email:</strong> <a href="mailto:${order.bid.vendor.contact_email}" style="color: #16a34a;">${order.bid.vendor.contact_email}</a></p>` : ''}
              <p style="margin: 8px 0; font-size: 14px; color: #444;"><strong>Order total:</strong> $${amount}</p>
            </div>
            <p style="font-size: 13px; color: #999; text-align: center;">Please coordinate directly with your vendor for delivery scheduling and logistics.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="https://fairwayprocurement.com/orders" style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View order details →</a>
            </div>
            <p style="font-size: 13px; color: #999; text-align: center;">— The Fairway Team</p>
          </div>`
        )
      }

      // Email to vendor
      const vendorEmail = order?.bid?.vendor?.contact_email
      if (vendorEmail) {
        await sendEmail(
          vendorEmail,
          `You have a new contract: ${orderTitle}`,
          `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 48px; margin-bottom: 8px;">🏆</div>
              <h1 style="font-size: 22px; color: #0a2e1f; margin: 0;">You won a contract!</h1>
            </div>
            <p style="font-size: 15px; color: #444; line-height: 1.7;">Hi ${vendorName},</p>
            <p style="font-size: 15px; color: #444; line-height: 1.7;">Congratulations! Your bid of <strong>$${amount}</strong> on <strong>${orderTitle}</strong> has been awarded and payment confirmed. Here is your club contact to coordinate delivery:</p>
            <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h2 style="font-size: 16px; color: #0a2e1f; margin: 0 0 16px 0;">Club Details</h2>
              <p style="margin: 8px 0; font-size: 14px; color: #444;"><strong>Club:</strong> ${buyerName}</p>
              ${order?.request?.buyer?.phone ? `<p style="margin: 8px 0; font-size: 14px; color: #444;"><strong>Phone:</strong> <a href="tel:${order.request.buyer.phone}" style="color: #16a34a;">${order.request.buyer.phone}</a></p>` : ''}
              ${order?.request?.buyer?.contact_email ? `<p style="margin: 8px 0; font-size: 14px; color: #444;"><strong>Email:</strong> <a href="mailto:${order.request.buyer.contact_email}" style="color: #16a34a;">${order.request.buyer.contact_email}</a></p>` : ''}
            </div>
            <p style="font-size: 13px; color: #999; text-align: center;">Please reach out to coordinate delivery scheduling and logistics.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="https://fairwayprocurement.com/seller/orders" style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View order details →</a>
            </div>
            <p style="font-size: 13px; color: #999; text-align: center;">— The Fairway Team</p>
          </div>`
        )
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
