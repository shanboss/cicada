import { generateTicketPDF } from "../../../../../lib/email";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { ticketId } = await request.json();

    if (!ticketId) {
      return new Response(
        JSON.stringify({ error: "ticketId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data: ticket, error: fetchError } = await supabaseAdmin
      .from("tickets")
      .select(
        `
        ticket_number,
        qr_code_data,
        customer_name,
        events (
          event_title,
          date,
          time,
          location
        )
      `
      )
      .eq("id", ticketId)
      .single();

    if (fetchError || !ticket) {
      return new Response(
        JSON.stringify({ error: "Ticket not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const eventDetails = ticket.events
      ? {
          event_title: ticket.events.event_title,
          date: ticket.events.date,
          time: ticket.events.time,
          location: ticket.events.location,
        }
      : undefined;

    const pdfBuffer = await generateTicketPDF({
      ticketNumber: ticket.ticket_number,
      qrCodeDataUrl: ticket.qr_code_data,
      eventDetails,
      customerName: ticket.customer_name,
    });

    const filename = eventDetails?.event_title
      ? `${eventDetails.event_title.replace(/[^a-z0-9]/gi, "-").toLowerCase().substring(0, 30)}-${ticket.ticket_number}.pdf`
      : `ticket-${ticket.ticket_number}.pdf`;

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating ticket PDF:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate PDF", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
