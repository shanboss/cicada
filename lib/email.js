import { Resend } from "resend";
import PDFDocument from "pdfkit";

const resend = new Resend(process.env.RESEND_API_KEY);

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

      // Black background
      doc.rect(0, 0, pageWidth, pageHeight).fill("#000000");

      // Header
      doc
        .fontSize(36)
        .fillColor("#ffffff")
        .text("CICADA", margin, 50, { align: "center" })
        .fontSize(14)
        .fillColor("#a855f7")
        .text("Music Society", { align: "center" })
        .moveDown(2);

      // Event Details Section
      if (eventDetails) {
        doc
          .fontSize(24)
          .fillColor("#ffffff")
          .text(eventDetails.event_title || "Event", { align: "center" })
          .moveDown(0.5);

        // Ticket Type Badge — large and prominent for door staff
        if (ticketType) {
          const badgeText = ticketType.toUpperCase();
          const badgeFontSize = 18;
          doc.fontSize(badgeFontSize);
          const badgeWidth = doc.widthOfString(badgeText) + 40;
          const badgeHeight = 36;
          const badgeX = (pageWidth - badgeWidth) / 2;
          const badgeY = doc.y;

          doc
            .roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 8)
            .fill("#7c3aed");

          doc
            .fontSize(badgeFontSize)
            .fillColor("#ffffff")
            .text(badgeText, badgeX, badgeY + 9, {
              width: badgeWidth,
              align: "center",
            });

          doc.y = badgeY + badgeHeight + 12;
        }

        doc.fontSize(12).fillColor("#e9d5ff");

        if (eventDetails.date) {
          doc.text(`Date: ${eventDetails.date}`, margin, doc.y, { align: "center" });
        }
        if (eventDetails.time) {
          doc.text(`Time: ${eventDetails.time}`, { align: "center" });
        }
        if (eventDetails.location) {
          doc.text(`Location: ${eventDetails.location}`, { align: "center" });
        }
        doc.moveDown(2);
      }

      // QR Code Section
      doc
        .fontSize(14)
        .fillColor("#d1d5db")
        .text("Present this QR code at the entrance:", { align: "center" });
      doc.moveDown(1);

      // Convert QR code data URL to buffer
      const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
      const qrCodeBuffer = Buffer.from(base64Data, "base64");

      // Center the QR code with white background padding
      const qrSize = 200;
      const qrPadding = 20;
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = doc.y;

      doc
        .rect(qrX - qrPadding, qrY - qrPadding, qrSize + qrPadding * 2, qrSize + qrPadding * 2)
        .roundedRect(qrX - qrPadding, qrY - qrPadding, qrSize + qrPadding * 2, qrSize + qrPadding * 2, 12)
        .fill("#ffffff");

      doc.image(qrCodeBuffer, qrX, qrY, {
        width: qrSize,
        height: qrSize,
      });

      // Move cursor past the QR code
      doc.y = qrY + qrSize + qrPadding + 20;

      // Ticket Number
      doc
        .fontSize(10)
        .fillColor("#9ca3af")
        .text(`Ticket Number: ${ticketNumber}`, margin, doc.y, { align: "center" })
        .moveDown(0.5);

      // Customer Name (if provided)
      if (customerName) {
        doc
          .fontSize(10)
          .fillColor("#9ca3af")
          .text(`Guest: ${customerName}`, { align: "center" })
          .moveDown(2);
      } else {
        doc.moveDown(2);
      }

      // Footer Information
      doc
        .fontSize(9)
        .fillColor("#d1d5db")
        .text("Important Information:", { align: "left" })
        .moveDown(0.3)
        .fontSize(8)
        .fillColor("#9ca3af")
        .text("• Please arrive 15-30 minutes before the event starts", {
          align: "left",
        })
        .text("• Each ticket is valid for one person only", { align: "left" })
        .text("• Save this PDF or take a screenshot of your QR code", {
          align: "left",
        })
        .text("• No refunds or exchanges", { align: "left" })
        .moveDown(1);

      doc
        .fontSize(8)
        .fillColor("#6b7280")
        .text("Questions? Message us on Instagram @cicada.dtx", {
          align: "center",
        })
        .text("© 2025 Cicada Collective. All rights reserved.", {
          align: "center",
        });

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
      <p style="margin-top: 10px;">&copy; 2025 Cicada Collective. All rights reserved.</p>
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
