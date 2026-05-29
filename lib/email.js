import { Resend } from "resend";
import PDFDocument from "pdfkit";
import path from "path";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

const MONUMENT_REGULAR = path.join(process.cwd(), "public/fonts/Monument/MonumentExtended-Regular.otf");
const MONUMENT_BOLD = path.join(process.cwd(), "public/fonts/Monument/MonumentExtended-Ultrabold.otf");

/**
 * Generate a PDF ticket for a single ticket
 * @param {Object} params
 * @param {string} params.ticketNumber - Ticket number
 * @param {string} params.qrCodeDataUrl - QR code as data URL
 * @param {Object} params.eventDetails - Event information
 * @param {string} params.customerName - Customer name
 * @param {string} [params.ticketType] - Ticket tier label
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generateTicketPDF({
  ticketNumber,
  qrCodeDataUrl,
  eventDetails,
  customerName,
  ticketType,
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margin: 50,
      });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = doc.page.margins.left;

      // Register Monument fonts
      doc.registerFont("Monument", MONUMENT_REGULAR);
      doc.registerFont("Monument-Bold", MONUMENT_BOLD);

      const contentWidth = pageWidth - margin * 2;

      // White background
      doc.rect(0, 0, pageWidth, pageHeight).fill("#ffffff");

      // All Y positions are absolute to guarantee single page
      // LETTER = 612 x 792

      // ── Header banner ── (Y: 40–75)
      doc
        .font("Monument-Bold")
        .fontSize(9)
        .fillColor("#000000")
        .text("THIS IS YOUR TICKET", margin, 40, { continued: true, lineBreak: false })
        .fillColor("#7c3aed")
        .text("  —  PROCEED DIRECTLY TO THE ENTRANCE", { lineBreak: false });

      doc
        .font("Monument")
        .fontSize(6)
        .fillColor("#666666")
        .text("A PHOTO ID MAY BE REQUIRED", margin, 56, { lineBreak: false });

      // Divider
      doc.moveTo(margin, 72).lineTo(pageWidth - margin, 72).strokeColor("#e0e0e0").lineWidth(1).stroke();

      // ── Main section ── (Y: 88–248)
      const mainY = 88;
      const qrSize = 140;
      const qrPadding = 10;
      const qrBlockWidth = qrSize + qrPadding * 2;
      const qrX = pageWidth - margin - qrBlockWidth;

      // Left: CICADA branding block
      const brandBoxSize = 110;
      doc.roundedRect(margin, mainY, brandBoxSize, brandBoxSize, 8).fill("#000000");
      doc.font("Monument").fontSize(15).fillColor("#ffffff")
        .text("CICADA", margin, mainY + 35, { width: brandBoxSize, align: "center", lineBreak: false });
      doc.font("Monument").fontSize(6).fillColor("#a855f7")
        .text("MUSIC SOCIETY", margin, mainY + 55, { width: brandBoxSize, align: "center", lineBreak: false });

      // Middle: Event details
      const infoX = margin + brandBoxSize + 16;
      const infoWidth = qrX - infoX - 16;

      doc.font("Monument-Bold").fontSize(13).fillColor("#000000")
        .text((eventDetails?.event_title || "Event").toUpperCase(), infoX, mainY, { width: infoWidth });

      // Format date
      let dateStr = eventDetails?.date || "";
      try {
        if (dateStr) {
          const d = new Date(dateStr + "T00:00:00");
          dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        }
      } catch (_) {}

      // Format time
      let timeStr = eventDetails?.time || "";
      try {
        if (timeStr) {
          timeStr = new Date(`1970-01-01T${timeStr}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
        }
      } catch (_) {}

      doc.font("Monument").fontSize(8).fillColor("#333333");
      let detailY = mainY + 40;
      if (dateStr) { doc.text(dateStr, infoX, detailY, { width: infoWidth, lineBreak: false }); detailY += 14; }
      if (timeStr) { doc.text("Doors: " + timeStr, infoX, detailY, { width: infoWidth, lineBreak: false }); detailY += 14; }
      if (eventDetails?.location) { doc.text(eventDetails.location, infoX, detailY, { width: infoWidth, lineBreak: false }); }

      // Right: QR code
      doc.roundedRect(qrX, mainY, qrBlockWidth, qrBlockWidth, 12).fill("#f3f4f6");

      const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
      const qrCodeBuffer = Buffer.from(base64Data, "base64");

      doc.save();
      doc.roundedRect(qrX + qrPadding, mainY + qrPadding, qrSize, qrSize, 10).clip();
      doc.image(qrCodeBuffer, qrX + qrPadding, mainY + qrPadding, { width: qrSize, height: qrSize });
      doc.restore();

      // ── Divider below main ── (Y: 260)
      const divider2Y = mainY + qrBlockWidth + 12;
      doc.moveTo(margin, divider2Y).lineTo(pageWidth - margin, divider2Y).strokeColor("#e0e0e0").lineWidth(1).stroke();

      // ── Ticket info row ── (Y: 272–310)
      const rowY = divider2Y + 12;
      const colWidth = contentWidth / 3;

      doc.font("Monument-Bold").fontSize(7).fillColor("#999999")
        .text("TICKET TYPE", margin, rowY, { width: colWidth, lineBreak: false });
      doc.font("Monument-Bold").fontSize(9).fillColor("#000000")
        .text((ticketType || "General Admission").toUpperCase(), margin, rowY + 12, { width: colWidth, lineBreak: false });

      doc.font("Monument-Bold").fontSize(7).fillColor("#999999")
        .text("ORDER #", margin + colWidth, rowY, { width: colWidth, lineBreak: false });
      doc.font("Monument").fontSize(9).fillColor("#000000")
        .text(ticketNumber, margin + colWidth, rowY + 12, { width: colWidth, lineBreak: false });

      doc.font("Monument-Bold").fontSize(7).fillColor("#999999")
        .text("QTY", margin + colWidth * 2, rowY, { width: colWidth, lineBreak: false });
      doc.font("Monument").fontSize(9).fillColor("#000000")
        .text("1", margin + colWidth * 2, rowY + 12, { width: colWidth, lineBreak: false });

      // ── Divider ── (Y: 310)
      const divider3Y = rowY + 34;
      doc.moveTo(margin, divider3Y).lineTo(pageWidth - margin, divider3Y).strokeColor("#e0e0e0").lineWidth(1).stroke();

      // ── Bottom section ── (Y: 322)
      const bottomY = divider3Y + 12;

      doc.font("Monument-Bold").fontSize(7).fillColor("#999999")
        .text("PURCHASED BY", margin, bottomY, { width: contentWidth / 2, lineBreak: false });
      doc.font("Monument").fontSize(9).fillColor("#000000")
        .text(customerName || "Guest", margin, bottomY + 12, { width: contentWidth / 2, lineBreak: false });

      doc.font("Monument").fontSize(5).fillColor("#999999")
        .text(
          "This ticket is non-transferable. Duplicate tickets will not be honored. The venue reserves the right to refuse entry. All sales are final — no refunds or exchanges.",
          margin + contentWidth / 2, bottomY,
          { width: contentWidth / 2, lineGap: 2 }
        );

      // ── Thank you message ──
      const thankYouY = divider3Y + 80;
      doc.font("Monument").fontSize(8).fillColor("#aaaaaa")
        .text(
          "From all of your friends from Cicada, thank you for your support. We greatly appreciate your help big or small to make this wild fantasy a reality. We hope you enjoy your experience and don't hesitate to reach out to us at our Instagram @cicada.dtx for any assistance.",
          margin, thankYouY,
          { width: contentWidth, align: "center", lineGap: 4 }
        );

      // ── Footer ── (Y: 730–742)
      const footerY = pageHeight - 60;
      doc.moveTo(margin, footerY - 10).lineTo(pageWidth - margin, footerY - 10).strokeColor("#e0e0e0").lineWidth(0.5).stroke();

      doc.font("Monument").fontSize(6).fillColor("#999999")
        .text("Questions? @cicada.dtx on Instagram", margin, footerY, { width: contentWidth / 2, lineBreak: false });
      doc.font("Monument").fontSize(6).fillColor("#999999")
        .text("© 2025 Cicada Collective", margin + contentWidth / 2, footerY, { width: contentWidth / 2, align: "right", lineBreak: false });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Build the ticket email HTML — simple body with PDF attachments
 * @param {Object} params
 * @param {string} params.customerName - Customer name
 * @param {number} params.ticketCount - Number of tickets attached
 * @param {Object} params.eventDetails - Event information
 * @returns {string} - The email HTML
 */
export function buildTicketEmailHtml({
  customerName,
  ticketCount = 1,
  eventDetails,
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Cicada Ticket</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #000000; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; padding: 30px 0;">
      <h1 style="font-size: 36px; font-weight: bold; margin: 0; color: #ffffff;">CICADA</h1>
      <p style="color: #a855f7; margin-top: 5px; font-size: 14px;">Music Society</p>
    </div>

    <div style="background-color: #1a1a1a; border-radius: 12px; padding: 30px; margin: 20px 0;">
      <p style="color: #d1d5db; line-height: 1.6; font-size: 16px;">
        Hi ${customerName || "there"},
      </p>
      <p style="color: #d1d5db; line-height: 1.6; font-size: 16px;">
        Your ${ticketCount > 1 ? `${ticketCount} tickets` : "ticket"} for <strong>${eventDetails?.event_title || "our event"}</strong> ${ticketCount > 1 ? "are" : "is"} attached to this email.
      </p>
      <p style="color: #d1d5db; line-height: 1.6; font-size: 16px;">
        See you there!
      </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
      <p>Questions? Message us on <a href="https://www.instagram.com/cicada.dtx/" style="color: #a855f7;">Instagram</a></p>
      <p style="margin-top: 10px;">&copy; 2026 Cicada Collective. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send ticket email with QR code(s)
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.customerName - Customer name
 * @param {Array} params.tickets - Array of ticket objects [{ticketNumber, qrCodeDataUrl}]
 * @param {Object} params.eventDetails - Event information
 */
export async function sendTicketEmail({
  to,
  customerName,
  tickets,
  eventDetails,
}) {
  // Support both single ticket (legacy) and multiple tickets
  const ticketArray = Array.isArray(tickets)
    ? tickets
    : [{ ticketNumber: tickets, qrCodeDataUrl: tickets }];
  try {
    const emailHtml = buildTicketEmailHtml({
      customerName,
      ticketCount: ticketArray.length,
      eventDetails,
    });

    // Generate PDF attachments only
    const attachments = [];

    for (const ticket of ticketArray) {
      try {
        const pdfBuffer = await generateTicketPDF({
          ticketNumber: ticket.ticketNumber,
          qrCodeDataUrl: ticket.qrCodeDataUrl,
          eventDetails: eventDetails,
          customerName: customerName,
          ticketType: ticket.ticketType,
        });

        const pdfBase64 = pdfBuffer.toString("base64");

        let filename = `ticket-${ticket.ticketNumber}.pdf`;
        if (eventDetails?.event_title) {
          const sanitizedTitle = eventDetails.event_title
            .replace(/[^a-z0-9]/gi, "-")
            .toLowerCase()
            .substring(0, 30);
          filename = `${sanitizedTitle}-${ticket.ticketNumber}.pdf`;
        }

        attachments.push({
          filename: filename,
          content: pdfBase64,
        });
      } catch (pdfError) {
        console.error(`Error generating PDF for ticket ${ticket.ticketNumber}:`, pdfError);
      }
    }

    const { data, error } = await resend.emails.send({
      from: "Cicada Collective <noreply@mucicada.com>",
      to: [to],
      subject: `Your ${
        ticketArray.length > 1 ? `${ticketArray.length} Tickets` : "Ticket"
      } for ${eventDetails?.event_title || "Cicada Event"}`,
      html: emailHtml,
      attachments: attachments,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to send ticket email:", error);
    throw error;
  }
}

/**
 * Generate a signed unsubscribe URL for an email address.
 * Uses HMAC-SHA256 with UNSUBSCRIBE_SECRET (falls back to SUPABASE_SERVICE_ROLE_KEY).
 * @param {string} email - The email address to unsubscribe
 * @returns {string} - Full unsubscribe URL with email and token params
 */
export function generateUnsubscribeUrl(email) {
  const secret = process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token = crypto.createHmac("sha256", secret).update(email).digest("hex");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mucicada.com";
  return `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

/**
 * Send confirmation email without QR code (fallback)
 */
export async function sendConfirmationEmail({
  to,
  customerName,
  orderDetails,
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Cicada Collective<noreply@mucicada.com>",
      to: [to],
      subject: "Order Confirmation - Cicada Collective",
      html: `
        <h1>Thank you for your purchase!</h1>
        <p>Hi ${customerName || "there"},</p>
        <p>Your order has been confirmed. You will receive your ticket details shortly.</p>
        <p>Order ID: ${orderDetails?.orderId}</p>
      `,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    throw error;
  }
}
