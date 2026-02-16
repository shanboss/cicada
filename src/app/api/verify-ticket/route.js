import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidTicketNumber } from "../../../../lib/qrcode";

// Initialize Supabase with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { ticketNumber } = await request.json();

    if (!ticketNumber) {
      return NextResponse.json(
        { error: "Ticket number is required" },
        { status: 400 }
      );
    }

    // Validate ticket number format
    if (!isValidTicketNumber(ticketNumber)) {
      return NextResponse.json(
        { error: "Invalid ticket format", valid: false },
        { status: 200 }
      );
    }

    // Fetch ticket from database with event details
    const { data: ticket, error } = await supabaseAdmin
      .from("tickets")
      .select(
        `
        *,
        events (
          id,
          event_title,
          date,
          time,
          location,
          image
        )
      `
      )
      .eq("ticket_number", ticketNumber)
      .single();

    if (error || !ticket) {
      return NextResponse.json(
        { error: "Ticket not found", valid: false },
        { status: 200 }
      );
    }

    // Check if ticket is already used
    if (ticket.used) {
      return NextResponse.json({
        valid: false,
        alreadyUsed: true,
        usedDate: ticket.used_date,
        ticket: {
          ticket_number: ticket.ticket_number,
          customer_name: ticket.customer_name,
          customer_email: ticket.customer_email,
          event: ticket.events,
          purchase_date: ticket.purchase_date,
        },
      });
    }

    // Ticket is valid and not used
    return NextResponse.json({
      valid: true,
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        customer_name: ticket.customer_name,
        customer_email: ticket.customer_email,
        event: ticket.events,
        purchase_date: ticket.purchase_date,
        used: ticket.used,
      },
    });
  } catch (error) {
    console.error("Error verifying ticket:", error);
    return NextResponse.json(
      { error: "Failed to verify ticket" },
      { status: 500 }
    );
  }
}

// Mark ticket as used (ticketId is UUID string)
export async function PUT(request) {
  try {
    const { ticketId } = await request.json();

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    // Update ticket as used
    const { data, error } = await supabaseAdmin
      .from("tickets")
      .update({
        used: true,
        used_date: new Date().toISOString(),
      })
      .eq("id", String(ticketId))
      .select()
      .single();

    if (error) {
      console.error("Error marking ticket as used:", error);
      return NextResponse.json(
        { error: "Failed to mark ticket as used" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, ticket: data });
  } catch (error) {
    console.error("Error in PUT:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

