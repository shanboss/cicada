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
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      await handleCheckoutSessionCompleted(session);
      break;

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("Payment intent succeeded:", paymentIntent.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session) {
  try {
    console.log("Processing checkout session:", session.id);

    // Check if tickets already exist for this session (idempotency)
    const { data: existingTickets, error: checkError } = await supabaseAdmin
      .from("tickets")
      .select("id, ticket_number, qr_code_data")
      .eq("stripe_session_id", session.id);

    if (checkError) {
      console.error("Error checking existing tickets:", checkError);
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
      console.error("Error creating tickets:", ticketError);
      return;
    }

    console.log(`${tickets.length} ticket(s) created`);

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

