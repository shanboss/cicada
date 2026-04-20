import { buildTicketEmailHtml } from "../../../../lib/email";
import QRCode from "qrcode";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const qrCode1 = await QRCode.toDataURL("TICKET-ABC123-001", { width: 200 });
  const qrCode2 = await QRCode.toDataURL("TICKET-ABC123-002", { width: 200 });

  const html = buildTicketEmailHtml({
    customerName: "Jane Doe",
    tickets: [
      { ticketNumber: "TICKET-ABC123-001", qrCodeDataUrl: qrCode1 },
      { ticketNumber: "TICKET-ABC123-002", qrCodeDataUrl: qrCode2 },
    ],
    eventDetails: {
      event_title: "Neon Nights Vol. 3",
      date: "Saturday, March 15, 2025",
      time: "9:00 PM - 2:00 AM",
      location: "The Underground, 123 Main St, Austin TX",
    },
    imageSource: "inline",
  });

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
