import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "../../../../../lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { generateTicketNumber, generateQRCode } from "../../../../../lib/qrcode";
import { sendTicketEmail } from "../../../../../lib/email";

// Initialize Supabase with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  console.log("🔔 Webhook received!");
  
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    console.error("❌ No stripe-signature header found");
    return NextResponse.json(
      { error: "No signature header" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is not set in environment variables");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook signature verified. Event type:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      console.log("🎫 Processing checkout.session.completed event");
      const session = event.data.object;
      console.log("📋 Session ID:", session.id);
      console.log("📧 Customer Email:", session.customer_details?.email);
      console.log("💰 Payment Status:", session.payment_status);
      console.log("📦 Session Status:", session.status);
      
      // Only process if payment is actually completed
      if (session.payment_status === 'paid' && session.status === 'complete') {
        await handleCheckoutSessionCompleted(session);
      } else {
        console.log("⚠️ Session not fully paid yet. Payment status:", session.payment_status, "Session status:", session.status);
      }
      break;

    case "checkout.session.async_payment_succeeded":
      console.log("🎫 Processing checkout.session.async_payment_succeeded event");
      const asyncSession = event.data.object;
      console.log("📋 Session ID:", asyncSession.id);
      console.log("📧 Customer Email:", asyncSession.customer_details?.email);
      await handleCheckoutSessionCompleted(asyncSession);
      break;

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("💳 Payment intent succeeded:", paymentIntent.id);
      // Try to find the checkout session from the payment intent
      if (paymentIntent.metadata?.checkout_session_id) {
        console.log("🔍 Found checkout session ID in payment intent metadata");
        try {
          const session = await stripe.checkout.sessions.retrieve(
            paymentIntent.metadata.checkout_session_id
          );
          if (session.payment_status === 'paid' && session.status === 'complete') {
            await handleCheckoutSessionCompleted(session);
          }
        } catch (err) {
          console.error("Error retrieving session from payment intent:", err);
        }
      }
      break;

    case "charge.updated":
    case "charge.succeeded":
      const charge = event.data.object;
      console.log("💳 Charge event received:", event.type);
      console.log("📋 Charge ID:", charge.id);
      console.log("💵 Payment Intent ID:", charge.payment_intent);
      
      // Try to find checkout sessions with this payment intent
      if (charge.payment_intent) {
        try {
          console.log("🔍 Searching for checkout sessions with payment intent:", charge.payment_intent);
          const sessions = await stripe.checkout.sessions.list({
            payment_intent: charge.payment_intent,
            limit: 1,
          });
          
          if (sessions.data && sessions.data.length > 0) {
            const session = sessions.data[0];
            console.log("✅ Found checkout session:", session.id);
            console.log("💰 Payment Status:", session.payment_status);
            console.log("📦 Session Status:", session.status);
            
            if (session.payment_status === 'paid' && session.status === 'complete') {
              console.log("🎫 Processing checkout session from charge event");
              await handleCheckoutSessionCompleted(session);
            } else {
              console.log("⚠️ Session not ready yet. Payment status:", session.payment_status);
            }
          } else {
            console.log("⚠️ No checkout session found for payment intent:", charge.payment_intent);
          }
        } catch (err) {
          console.error("❌ Error finding checkout session from charge:", err);
        }
      }
      break;

    default:
      console.log(`⚠️ Unhandled event type: ${event.type}`);
      // Log the full event for debugging
      console.log("📄 Event data:", JSON.stringify(event.data.object, null, 2));
  }

  console.log("✅ Webhook processed successfully");
  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session) {
  try {
    console.log("🚀 Starting ticket creation process for session:", session.id);
    console.log("📊 Full session object:", JSON.stringify(session, null, 2));

    // Check if tickets already exist for this session (idempotency)
    const { data: existingTickets, error: checkError } = await supabaseAdmin
      .from("tickets")
      .select("id, ticket_number, qr_code_data")
      .eq("stripe_session_id", session.id);

    if (checkError) {
      console.error("❌ Error checking existing tickets:", checkError);
      console.error("Error details:", JSON.stringify(checkError, null, 2));
    } else {
      console.log("✅ Checked for existing tickets. Found:", existingTickets?.length || 0);
    }

    // If tickets already exist, skip creation (webhook was already processed)
    if (existingTickets && existingTickets.length > 0) {
      console.log(
        `Tickets already exist for session ${session.id}. Skipping creation.`
      );
      return;
    }

    // Extract customer information
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;
    const quantity = parseInt(session.metadata?.quantity || "1");

    if (!customerEmail) {
      console.error("No customer email found in session");
      return;
    }

    console.log(`Creating ${quantity} ticket(s) for ${customerEmail}`);

    // Get event ID from session metadata
    const eventId = session.metadata?.event_id;
    
    let event = null;
    if (eventId) {
      const { data, error: eventError } = await supabaseAdmin
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) {
        console.error("Error fetching event:", eventError);
      } else {
        event = data;
      }
    }

    // If no event found via metadata, try to get the next upcoming event
    if (!event) {
      const { data: events, error: eventError } = await supabaseAdmin
        .from("events")
        .select("*")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(1);

      if (!eventError && events?.[0]) {
        event = events[0];
      }
    }

    // Create multiple tickets based on quantity
    const ticketsToCreate = [];
    const qrCodes = [];

    for (let i = 0; i < quantity; i++) {
      const ticketNumber = generateTicketNumber();
      const qrCodeDataUrl = await generateQRCode(ticketNumber);

      ticketsToCreate.push({
        ticket_number: ticketNumber,
        event_id: event?.id || null,
        customer_email: customerEmail,
        customer_name: customerName,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        qr_code_data: qrCodeDataUrl,
      });

      qrCodes.push({ ticketNumber, qrCodeDataUrl });
    }

    // Insert all tickets at once
    const { data: tickets, error: ticketError } = await supabaseAdmin
      .from("tickets")
      .insert(ticketsToCreate)
      .select();

    if (ticketError) {
      console.error("❌ Error creating tickets:", ticketError);
      console.error("Error details:", JSON.stringify(ticketError, null, 2));
      console.error("Tickets that failed to create:", JSON.stringify(ticketsToCreate, null, 2));
      throw ticketError; // Throw to be caught by outer try-catch
    }

    console.log(`✅ Successfully created ${tickets.length} ticket(s)`);
    console.log("🎫 Ticket IDs:", tickets.map(t => t.id));
    console.log("🎫 Ticket Numbers:", tickets.map(t => t.ticket_number));

    // Send ONE email with all QR codes
    try {
      await sendTicketEmail({
        to: customerEmail,
        customerName: customerName,
        tickets: qrCodes, // Pass array of all tickets
        eventDetails: event
          ? {
              event_title: event.event_title,
              date: event.date,
              time: event.time,
              location: event.location,
            }
          : null,
      });

      console.log(`Email with ${qrCodes.length} ticket(s) sent to:`, customerEmail);
    } catch (emailError) {
      console.error("Error sending ticket email:", emailError);
      // Don't fail the whole process if email fails
      // You might want to implement a retry mechanism
    }
  } catch (error) {
    console.error("Error handling checkout session:", error);
    throw error;
  }
}

// Disable body parsing, since we need the raw body for signature verification
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Next.js will by default parse the body, but we need the raw body for Stripe webhook verification
// Using request.text() handles this correctly

