import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateTicketNumber, generateQRCode } from "../../../../../lib/qrcode";
import { sendTicketEmail } from "../../../../../lib/email";

// Initialize Supabase with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { email, customerName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Generate ticket number and QR code
    const ticketNumber = generateTicketNumber();
    const qrCodeDataUrl = await generateQRCode(ticketNumber);

    // Get the next upcoming event (optional - can be null for admin-created tickets)
    const { data: events } = await supabaseAdmin
      .from("events")
      .select("*")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(1);

    const event = events?.[0] || null;

    // Create ticket in database
    const ticketData = {
      ticket_number: ticketNumber,
      event_id: event?.id || null,
      customer_email: email,
      customer_name: customerName || null,
      stripe_session_id: "admin-created", // Special identifier for admin-created tickets
      stripe_payment_intent: null,
      qr_code_data: qrCodeDataUrl,
    };

    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from("tickets")
      .insert(ticketData)
      .select()
      .single();

    if (ticketError) {
      console.error("Error creating admin ticket:", ticketError);
      return NextResponse.json(
        { error: "Failed to create ticket", details: ticketError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Admin ticket created: ${ticketNumber} for ${email}`);

    // Send email with ticket QR code
    try {
      const eventDetails = event
        ? {
            event_title: event.event_title,
            date: event.date,
            time: event.time,
            location: event.location,
          }
        : null;

      await sendTicketEmail({
        to: email,
        customerName: customerName || "Guest",
        tickets: [
          {
            ticketNumber: ticketNumber,
            qrCodeDataUrl: qrCodeDataUrl,
          },
        ],
        eventDetails: eventDetails,
      });

      console.log(`✅ Email sent successfully to ${email}`);
    } catch (emailError) {
      console.error("Error sending ticket email:", emailError);
      // Don't fail the ticket creation if email fails
      // The ticket is already created and can be viewed/manually sent
    }

    return NextResponse.json({
      success: true,
      ticket_number: ticket.ticket_number,
      customer_email: ticket.customer_email,
      customer_name: ticket.customer_name,
      qr_code_data: ticket.qr_code_data,
      event_id: ticket.event_id,
    });
  } catch (error) {
    console.error("Error in admin generate ticket:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
