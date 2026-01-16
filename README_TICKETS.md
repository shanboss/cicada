# 🎫 Cicada Ticket System

## Overview

Your Cicada Music Society website now has a complete automated ticket system with QR codes!

## ✨ Features

- 🎟️ **Automatic Ticket Generation** - QR codes created after successful payment
- 🎫 **Multiple Tickets** - Buy up to 10 tickets in one purchase
- 📧 **Email Delivery** - Beautiful branded email with all tickets included
- 🔒 **Secure Database** - All tickets stored in Supabase with auth protection
- 📱 **Mobile Friendly** - View tickets on any device
- 🎨 **Professional Design** - Branded emails and confirmation pages
- ⚡ **Real-time** - Tickets appear immediately on confirmation page
- 🔐 **Secure Access** - My Tickets page requires authentication

## 🎯 User Flow

1. User clicks "Buy Tickets" on event
2. **Checkout Preview Page** opens showing:
   - Event poster (left side)
   - Event details (right side)
   - Quantity selector (1-10 tickets)
   - Price summary with total
3. User selects quantity and clicks "Buy Now"
4. Redirected to Stripe checkout
5. Completes payment with card
6. Redirected to confirmation page with all QR codes (can screenshot!)
7. Receives ONE email with all tickets and QR codes
8. Can log in and view all tickets anytime at `/my-tickets`

**Multiple Tickets**: Each ticket gets its own unique QR code, all delivered in one convenient email!

## 🎫 Multiple Ticket Purchases

### How It Works:

**For Customers:**
- Select quantity using +/- buttons or type a number (1-10)
- Review order summary with subtotal and tax notice
- One payment checkout for all tickets
- Each ticket gets its own unique QR code
- All QR codes delivered in ONE email (no inbox clutter!)
- All tickets linked to their email address
- Can screenshot all QR codes from confirmation page

**For Verification:**
- Each ticket is independent
- Can be verified/used separately
- Email lookup shows all tickets for that customer
- Each person can enter with their own QR code

**Example:**
```
Customer buys 5 tickets
↓
Creates 5 unique tickets:
  - CICADA-ABC123-X1Y2Z3
  - CICADA-DEF456-A4B5C6
  - CICADA-GHI789-D7E8F9
  - CICADA-JKL012-G1H2I3
  - CICADA-MNO345-J4K5L6
↓
5 separate emails sent
↓
Each ticket can be used independently
```

### Use Cases:

**✅ Group Bookings** - Buy tickets for friends/family
**✅ Individual Entry** - Each person can enter with their own QR
**✅ Flexible Distribution** - Forward individual emails to each attendee
**✅ Independent Verification** - Tickets verified separately at entrance

## 🛠️ Admin: Adding Tickets to Events

### Step 1: Create Product in Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Products**
2. Click **Add Product**
3. Fill in:
   - **Name**: Event name (e.g., "Spring Concert 2026")
   - **Description**: Event details
   - **Price**: Ticket price (e.g., $25.00)
4. Click **Save**
5. **Copy the Price ID** (looks like `price_1ABCxyz...`)

### Step 2: Add Price ID to Event

Go to your Supabase SQL Editor and run:

```sql
UPDATE events 
SET stripe_price_id = 'price_YOUR_PRICE_ID_HERE'
WHERE id = YOUR_EVENT_ID;
```

**That's it!** The "Buy Tickets" button will now appear on that event.

## 📄 Pages

### `/events`
- Lists all upcoming and past events
- Shows "Buy Tickets" button if event has `stripe_price_id`
- Clicking button navigates to checkout preview page

### `/checkout/[eventId]`
- **NEW!** Checkout preview page
- Left: Event poster image
- Right: Event details, quantity selector, price summary
- "Buy Now" button redirects to Stripe
- Shows total price before payment

### `/return`
- Post-purchase confirmation page
- Displays QR code immediately (can screenshot!)
- Shows event details
- Links to view all tickets

### `/my-tickets`
- View all purchased tickets
- **Requires authentication** (login required for security)
- Shows QR codes for each ticket
- Displays event information

### `/verify`
- **Admin-only** QR code verification system
- Scan tickets at event entrance
- Real-time validation
- Mark tickets as used
- View scan history
- Manual entry backup option

## 🗄️ Database Tables

### `events` table
```sql
- id (bigint)
- event_title (text)
- date (date)
- time (time)
- location (text)
- desc (text)
- image (text)
- stripe_price_id (text) ← Links to Stripe
```

### `tickets` table
```sql
- id (bigserial)
- ticket_number (text) - Unique ID (CICADA-XXX-YYY)
- event_id (bigint) - Links to events table
- customer_email (text)
- customer_name (text)
- stripe_session_id (text)
- qr_code_data (text) - Base64 QR code image
- purchase_date (timestamp)
- used (boolean)
- used_date (timestamp)
```

## 🔧 Technical Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe Checkout
- **Email**: Resend API
- **QR Codes**: qrcode npm package

## 📧 Email Configuration

**Current Setup** (Development):
- Sender: `onboarding@resend.dev`
- Works for testing only

**Production Setup** (When ready):
1. Verify your domain in Resend
2. Update `lib/email.js` line 106:
   ```javascript
   from: "Cicada <tickets@yourdomain.com>"
   ```

## 🔍 How QR Verification Works

### Technical Flow:

1. **QR Code Contains**: Unique ticket number (e.g., `CICADA-L8X9F-A2B3C`)
2. **Scanner Reads**: Camera decodes QR code to extract ticket number
3. **API Validates**: 
   - Checks ticket exists in database
   - Verifies ticket format
   - Checks if already used
   - Fetches event details
4. **Display Result**: Shows ticket status and customer info
5. **Mark as Used**: Updates database with timestamp

### Database Update:

When a ticket is checked in:
```sql
UPDATE tickets 
SET 
  used = true,
  used_date = NOW()
WHERE id = ticket_id;
```

### Ticket States:

```
┌─────────────────────┐
│  Ticket Created     │
│  (used = false)     │
└──────────┬──────────┘
           │
           ▼
   ┌───────────────┐
   │  Scanned at   │
   │  Event        │
   └───────┬───────┘
           │
           ▼
┌─────────────────────┐
│  Marked as Used     │
│  (used = true)      │
│  + used_date saved  │
└─────────────────────┘
           │
           ▼
   ┌───────────────┐
   │  Subsequent   │
   │  Scans Show   │
   │  "Already     │
   │   Used"       │
   └───────────────┘
```

## 🧪 Testing

### Test Card Numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`

### Local Testing:
1. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Copy webhook secret to `.env.local`
3. Make a test purchase
4. Check terminal for webhook logs

### Production Testing:
1. Add webhook in Stripe Dashboard: `https://yourdomain.com/api/webhooks/stripe`
2. Select event: `checkout.session.completed`
3. Copy webhook secret to environment variables

## 📁 Key Files

```
lib/
  ├── email.js          - Email templates and sending
  ├── qrcode.js         - QR code generation
  └── stripe.js         - Stripe client initialization

src/app/
  ├── checkout/[eventId]/page.js - Checkout preview page (NEW!)
  ├── return/page.js             - Confirmation page with QR code
  ├── my-tickets/page.js         - View all tickets
  ├── verify/page.js             - QR code scanner for event staff
  ├── actions/
  │   └── createCheckout.js      - Create Stripe sessions
  └── api/
      ├── checkout-session/      - Fetch session status
      ├── verify-ticket/         - Ticket verification endpoint
      └── webhooks/stripe/       - Process payments

src/components/
  └── Events.js         - Event listing with buy buttons
```

## 🚀 Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] Domain verified in Resend (for production emails)
- [ ] Database RLS policies tested
- [ ] Test purchase on production

## 🔒 Environment Variables

Required in `.env.local` (and Vercel):

```env
# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Resend
RESEND_API_KEY=re_...
```

## 📊 Analytics & Reporting

To see ticket sales, run in Supabase:

```sql
-- Total tickets sold
SELECT COUNT(*) FROM tickets;

-- Tickets by event
SELECT 
  e.event_title,
  COUNT(t.id) as ticket_count,
  SUM(CASE WHEN t.used THEN 1 ELSE 0 END) as checked_in
FROM events e
LEFT JOIN tickets t ON t.event_id = e.id
GROUP BY e.id, e.event_title;

-- Recent sales
SELECT 
  t.ticket_number,
  t.customer_email,
  e.event_title,
  t.purchase_date
FROM tickets t
JOIN events e ON t.event_id = e.id
ORDER BY t.purchase_date DESC
LIMIT 10;
```

## 🎟️ Ticket Verification System

### At The Event

Event staff can verify tickets using the `/verify` page:

**Features:**
- 📷 **Camera Scanner** - Uses device camera to scan QR codes
- ✅ **Real-time Validation** - Instantly checks if ticket is valid
- 🔒 **Duplicate Prevention** - Detects already-used tickets
- 📝 **Scan History** - Tracks last 10 scanned tickets
- ⌨️ **Manual Entry** - Backup option if camera fails
- 📧 **Email Lookup** - Find tickets by customer email address
- 📊 **Event Details** - Shows customer and event information

**How to Use:**

*Option 1: QR Code Scanner*
1. Go to `/admin` and log in
2. Click "🎫 Verify Tickets" button
3. Click "Start Camera Scanner"
4. Point camera at ticket QR code
5. Review ticket details
6. Click "Check In (Mark as Used)"

*Option 2: Manual Entry*
1. Enter ticket number (CICADA-XXX-YYY)
2. Click "Verify"
3. Check in as normal

*Option 3: Email Lookup (Fastest for lost phones)*
1. Enter customer email address
2. Click "Search"
3. All tickets for that email appear
4. Click "Verify" on the correct ticket
5. ✓ Instantly checked in - button shows "Verified"

**Verification Results:**
- ✅ **Valid** (Green) - Ticket is authentic and ready to use
- ⚠️ **Already Used** (Yellow) - Ticket was already scanned
- ❌ **Invalid** (Red) - Ticket not found or fake

**Security:**
- Only authenticated users can access
- All scans are logged in database
- Tickets can only be used once
- Timestamp recorded for check-ins

## 🔐 Security

### Authentication Required for Ticket Viewing

The `/my-tickets` page requires users to be logged in. This prevents unauthorized access to tickets via email lookup.

**How it works:**
- Users must create an account and log in
- Tickets are only shown to the email address that purchased them
- Email is verified through Supabase authentication
- No one can view someone else's tickets

**Ticket Access:**
1. **Immediate**: Screenshot QR code from confirmation page after purchase
2. **Email**: Check email for ticket with QR code (permanent backup)
3. **Portal**: Log in to `/my-tickets` to view all tickets

## 🆘 Troubleshooting

### Emails not sending?
- Check RESEND_API_KEY is correct
- Verify "from" address in lib/email.js
- Check Resend logs: https://resend.com/logs

### Webhook not working?
- Verify STRIPE_WEBHOOK_SECRET matches
- Check webhook endpoint is accessible
- Review Stripe Dashboard webhook logs

### QR code not showing?
- Check ticket was created in database
- Verify qr_code_data field is populated
- Check browser console for errors

### Button not appearing?
- Verify event has stripe_price_id set
- Check database connection
- Refresh page and check console

---

**System Status: ✅ Fully Operational**

Built with ❤️ for Cicada Music Society

