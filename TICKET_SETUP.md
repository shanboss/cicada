# Ticket System Setup Guide

## 1. Create Supabase Tickets Table

Run this SQL in your Supabase SQL Editor:

```sql
-- First, add stripe_price_id column to events table (if not exists)
ALTER TABLE events ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Create tickets table
CREATE TABLE tickets (
  id BIGSERIAL PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  event_id BIGINT REFERENCES events(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  stripe_session_id TEXT NOT NULL, -- Removed UNIQUE to allow multiple tickets per session
  stripe_payment_intent TEXT,
  qr_code_data TEXT NOT NULL,
  purchase_date TIMESTAMP DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE,
  used_date TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_tickets_email ON tickets(customer_email);
CREATE INDEX idx_tickets_stripe_session ON tickets(stripe_session_id);
CREATE INDEX idx_tickets_event ON tickets(event_id);

-- Enable Row Level Security
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tickets by email
CREATE POLICY "Users can view own tickets" ON tickets
  FOR SELECT
  USING (auth.jwt() ->> 'email' = customer_email);

-- Policy: Service role can do everything (for server-side operations)
CREATE POLICY "Service role full access" ON tickets
  FOR ALL
  USING (auth.role() = 'service_role');
```

### Fix Existing Database (If you already created the table with UNIQUE constraint):

If you already created the `tickets` table with `stripe_session_id TEXT UNIQUE`, run this SQL to remove the unique constraint:

```sql
-- Remove the unique constraint on stripe_session_id
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_stripe_session_id_key;
```

This allows multiple tickets to be created for the same Stripe checkout session (when quantity > 1).

## 2. Set up Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_dashboard

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_supabase
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase

# Resend Email Configuration
# Get your API key from https://resend.com/api-keys
# IMPORTANT: Verify your domain first at https://resend.com/domains
RESEND_API_KEY=re_your_resend_api_key

# App Configuration (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important Notes:**

- For Resend: You MUST verify your domain before emails will send. In development, you can use `onboarding@resend.dev` as the from address.
- Update the "from" address in `/lib/email.js` once your domain is verified.
- The Stripe webhook secret is obtained when you create a webhook endpoint (see step 3).

## 3. Configure Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## 4. Create Stripe Products and Prices

For each event, you need to create a Product and Price in Stripe:

### Create in Stripe Dashboard:

1. Go to Stripe Dashboard > **Products** > **Add Product**
2. Fill in details:
   - **Name**: Your event name (e.g., "Cicada Spring Concert 2026")
   - **Description**: Event description
   - **Pricing**: One-time payment
   - **Price**: Your ticket price (e.g., $25.00)
   - **Currency**: USD
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_...`)

### Add Price ID to Event:

After creating the Stripe price, add it to your event in Supabase:

```sql
-- Update an existing event with Stripe Price ID
UPDATE events
SET stripe_price_id = 'price_YOUR_STRIPE_PRICE_ID_HERE'
WHERE id = YOUR_EVENT_ID;
```

Or add it when creating a new event through your admin panel.

**Note:** The Events component is already integrated! It will:

- Show the "Buy Tickets" button only if `stripe_price_id` is set
- Create a Stripe checkout session with event metadata
- Generate QR code tickets automatically after successful payment
- Send email with ticket and event details

## 5. Test the Flow

### Local Testing (Webhook):

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (Mac)
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the webhook signing secret to your `.env.local` as `STRIPE_WEBHOOK_SECRET`
5. Make a test purchase using test card: `4242 4242 4242 4242`

### Testing Checklist:

- [ ] User completes checkout and is redirected to `/return` page
- [ ] Success page shows confirmation
- [ ] Ticket is created in Supabase `tickets` table
- [ ] Email is sent to customer with QR code
- [ ] QR code displays correctly in email
- [ ] User can view ticket at `/my-tickets`
- [ ] Ticket shows correct event information

### Production Testing:

1. Deploy your app to Vercel
2. Add webhook endpoint in Stripe Dashboard: `https://yourdomain.com/api/webhooks/stripe`
3. Select `checkout.session.completed` event
4. Make a real purchase and verify the entire flow

## 6. Features Included

✅ Automatic ticket generation after successful payment
✅ Unique QR code for each ticket
✅ Email delivery with beautiful HTML template
✅ Ticket viewing page at `/my-tickets`
✅ Event information linked to tickets
✅ Secure webhook verification
✅ Database storage for ticket validation

## 7. Next Steps (Optional)

- Add QR code scanning functionality for event check-in
- Implement ticket transfer between users
- Add ticket download as PDF
- Create admin dashboard to view and validate tickets
- Add ticket analytics and reporting
