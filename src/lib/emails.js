// ============================================================
// EMAIL NOTIFICATIONS
// ============================================================
// Use Resend (resend.com) — $0 for first 3,000 emails/month
// Or Supabase built-in email for auth flows
//
// Install: npm install resend
// Set env: RESEND_API_KEY=re_your_key
// ============================================================

// These are the trigger points + email templates for each event.
// Deploy as Supabase Edge Functions or a lightweight Express server.

export const EMAIL_TRIGGERS = {

  // ── Buyer events ──────────────────────────────────────────

  REQUEST_PUBLISHED: {
    to: 'buyer',
    subject: 'Your request is live on Fairway',
    template: ({ buyerName, requestTitle, closeDate, vendorCount }) => `
Hi ${buyerName},

Your request "${requestTitle}" is now live on Fairway.

We've notified ${vendorCount} verified vendors in your area.
Most requests receive their first bid within 2 hours.

Your request closes: ${closeDate}

View bids → https://app.fairway.com/bids

— The Fairway Team
    `.trim(),
  },

  NEW_BID_RECEIVED: {
    to: 'buyer',
    subject: '💰 New bid on your request',
    template: ({ buyerName, requestTitle, vendorName, bidAmount, budgetAmount }) => {
      const savings = budgetAmount - bidAmount
      const pct = Math.round(savings / budgetAmount * 100)
      return `
Hi ${buyerName},

${vendorName} just submitted a bid on "${requestTitle}".

Bid amount:  $${bidAmount.toLocaleString()}
Your budget: $${budgetAmount.toLocaleString()}
You save:    $${savings.toLocaleString()} (${pct}%)

View & compare all bids → https://app.fairway.com/bids

— The Fairway Team
      `.trim()
    },
  },

  BID_CLOSING_SOON: {
    to: 'buyer',
    subject: '⏰ Your request closes in 24 hours',
    template: ({ buyerName, requestTitle, bidCount, bestAmount }) => `
Hi ${buyerName},

"${requestTitle}" closes in 24 hours with ${bidCount} bids.

Best bid so far: $${bestAmount.toLocaleString()}

Award a bid now → https://app.fairway.com/bids

— The Fairway Team
    `.trim(),
  },

  ORDER_CONFIRMED: {
    to: 'buyer',
    subject: '✅ Order confirmed',
    template: ({ buyerName, requestTitle, vendorName, amount, deliveryDate, poNumber }) => `
Hi ${buyerName},

Your order has been confirmed.

PO Number: ${poNumber}
Item: ${requestTitle}
Vendor: ${vendorName}
Amount: $${amount.toLocaleString()}
Est. delivery: ${deliveryDate}

View order → https://app.fairway.com/orders

— The Fairway Team
    `.trim(),
  },

  // ── Seller events ─────────────────────────────────────────

  NEW_REQUEST_MATCHING: {
    to: 'seller',
    subject: '🏌️ New opportunity near you',
    template: ({ vendorName, requestTitle, clubName, budget, distance, closeDate }) => `
Hi ${vendorName},

A new request matching your category is open near you.

Request: ${requestTitle}
Club: ${clubName} (${distance} miles away)
Budget: $${budget.toLocaleString()}
Closes: ${closeDate}

Place a bid → https://app.fairway.com/seller

Tip: bids submitted within 4 hours win 55% more often.

— The Fairway Team
    `.trim(),
  },

  BID_AWARDED: {
    to: 'seller',
    subject: '🎉 You won a bid!',
    template: ({ vendorName, requestTitle, clubName, amount }) => `
Hi ${vendorName},

Congratulations! Your bid was selected.

Request: ${requestTitle}
Club: ${clubName}
Award amount: $${amount.toLocaleString()}

Next steps:
1. Contact the club to confirm delivery details
2. Complete delivery per your bid terms
3. Payment will be released via Stripe after delivery confirmation

View order → https://app.fairway.com/seller/orders

— The Fairway Team
    `.trim(),
  },

  BID_NOT_SELECTED: {
    to: 'seller',
    subject: 'Bid update on Fairway',
    template: ({ vendorName, requestTitle }) => `
Hi ${vendorName},

The club has selected another bid for "${requestTitle}" this time.

There are 23 more open requests in your area — check them out:
→ https://app.fairway.com/seller

— The Fairway Team
    `.trim(),
  },
}

// ─── Send email via Resend ─────────────────────────────────────
// Deploy this as a Supabase Edge Function or call from your API route
//
// import { Resend } from 'npm:resend'
//
// const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
//
// export async function sendEmail({ to, subject, text }) {
//   await resend.emails.send({
//     from: 'Fairway <noreply@fairway.com>',
//     to,
//     subject,
//     text,
//   })
// }

// ─── Supabase Database Webhooks ────────────────────────────────
// In Supabase Dashboard → Database → Webhooks → Create webhook:
//
// Trigger: bids INSERT → call /api/on-new-bid
// Trigger: requests INSERT → call /api/on-new-request
// Trigger: orders INSERT → call /api/on-order-created
//
// Each webhook handler pulls the record, builds the email, sends it.
