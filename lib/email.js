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
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generateTicketPDF({
  ticketNumber,
  qrCodeDataUrl,
  eventDetails,
  customerName,
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
          .moveDown(1);

        doc.fontSize(12).fillColor("#e9d5ff");

        if (eventDetails.date) {
          doc.text(`Date: ${eventDetails.date}`, { align: "center" });
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
        .text("Questions? Contact us at support@mucicada.com", {
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
 * Build the ticket email HTML
 * @param {Object} params
 * @param {string} params.customerName - Customer name
 * @param {Array} params.tickets - Array of ticket objects [{ticketNumber, qrCodeDataUrl}]
 * @param {Object} params.eventDetails - Event information
 * @param {Object} [params.imageSource] - How to reference images: "cid" (default) for email cid: refs, "inline" for data URI src
 * @returns {string} - The email HTML
 */
export function buildTicketEmailHtml({
  customerName,
  tickets,
  eventDetails,
  imageSource = "cid",
}) {
  const ticketArray = Array.isArray(tickets)
    ? tickets
    : [{ ticketNumber: tickets, qrCodeDataUrl: tickets }];

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
    <!-- Header -->
    <div style="text-align: center; padding: 30px 0;">
      <h1 style="font-size: 36px; font-weight: bold; margin: 0; color: #ffffff;">CICADA</h1>
      <p style="color: #a855f7; margin-top: 5px; font-size: 14px;">Music Society</p>
    </div>

    <!-- Main Content -->
    <div style="background-color: #1a1a1a; border-radius: 12px; padding: 30px; margin: 20px 0;">
      <h2 style="color: #ffffff; margin-top: 0;">Your Ticket is Ready!</h2>

      <p style="color: #d1d5db; line-height: 1.6;">
        Hi ${customerName || "there"},
      </p>

      <p style="color: #d1d5db; line-height: 1.6;">
        Thank you for your purchase! Your ${
          ticketArray.length > 1 ? `${ticketArray.length} tickets` : "ticket"
        } for <strong>${eventDetails?.event_title || "our event"}</strong> ${
      ticketArray.length > 1 ? "are" : "is"
    } confirmed.
      </p>

      <!-- Event Details -->
      ${
        eventDetails
          ? `
      <div style="background-color: #4c1d95; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #ffffff; margin-top: 0; font-size: 18px;">Event Details</h3>
        <p style="color: #e9d5ff; margin: 8px 0;"><strong>Event:</strong> ${eventDetails.event_title}</p>
        <p style="color: #e9d5ff; margin: 8px 0;"><strong>Date:</strong> ${eventDetails.date}</p>
        <p style="color: #e9d5ff; margin: 8px 0;"><strong>Time:</strong> ${eventDetails.time}</p>
        <p style="color: #e9d5ff; margin: 8px 0;"><strong>Location:</strong> ${eventDetails.location}</p>
      </div>
      `
          : ""
      }

      <!-- QR Code(s) -->
      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #d1d5db; margin-bottom: 15px;">
          ${
            ticketArray.length > 1
              ? `Your ${ticketArray.length} tickets:`
              : "Present this QR code at the entrance:"
          }
        </p>
        ${ticketArray
          .map(
            (ticket, index) => `
          <div style="background-color: #1a1a1a; display: inline-block; padding: 20px; border-radius: 12px; margin: 10px; ${
            ticketArray.length > 1 ? "vertical-align: top;" : ""
          }">
            ${
              ticketArray.length > 1
                ? `<p style="color: #a855f7; font-weight: bold; margin-bottom: 10px;">Ticket ${
                    index + 1
                  }</p>`
                : ""
            }
            <div style="background-color: #ffffff; padding: 20px; border-radius: 12px;">
              <img src="${
                imageSource === "inline"
                  ? ticket.qrCodeDataUrl
                  : `cid:qrcode${index}`
              }" alt="Ticket QR Code ${
              index + 1
            }" style="width: 200px; height: 200px; display: block;" />
            </div>
            <p style="color: #9ca3af; font-size: 11px; margin-top: 10px;">
              ${ticket.ticketNumber}
            </p>
          </div>
        `
          )
          .join("")}
      </div>

      <!-- Account prompt -->
      <div style="background-color: #4c1d95; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="color: #e9d5ff; margin: 0; text-align: center; font-size: 14px; line-height: 1.6;">
          <strong>Tip:</strong> Create an account at <a href="https://www.mucicada.com/signup" style="color: #ffffff;">mucicada.com</a> using this email address to view and manage all your tickets anytime.
        </p>
      </div>

      ${
        ticketArray.length > 1
          ? `
      <div style="background-color: #4c1d95; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #e9d5ff; margin: 0; text-align: center; font-size: 14px;">
          <strong>Tip:</strong> Each person can use their own QR code for entry
        </p>
      </div>
      `
          : ""
      }

      <!-- Important Info -->
      <div style="border-top: 1px solid #374151; padding-top: 20px; margin-top: 30px;">
        <h3 style="color: #ffffff; font-size: 16px;">Important Information</h3>
        <ul style="color: #d1d5db; line-height: 1.8; padding-left: 20px;">
          <li>Each ticket is valid for one person only</li>
          ${
            ticketArray.length > 1
              ? "<li>Each person should have their own QR code for entry</li>"
              : ""
          }
          <li>Download your ticket PDF${
            ticketArray.length > 1 ? "s" : ""
          } from the attachments below</li>
          <li>Save this email or take a screenshot of your QR code${
            ticketArray.length > 1 ? "s" : ""
          }</li>
          <li>No refunds or exchanges</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
      <p>Questions? Contact us at <a href="mailto:support@mucicada.com" style="color: #a855f7;">support@mucicada.com</a></p>
      <p style="margin-top: 10px;">© 2025 Cicada Collective. All rights reserved.</p>
      <p style="margin-top: 15px;">
        <a href="https://www.instagram.com/cicada.dtx/" style="color: #a855f7; text-decoration: none;">Instagram</a>
      </p>
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
      tickets: ticketArray,
      eventDetails,
    });

    // Generate PDFs for each ticket and prepare attachments
    const pdfAttachments = [];
    const imageAttachments = [];

    for (let index = 0; index < ticketArray.length; index++) {
      const ticket = ticketArray[index];

      // Generate PDF for this ticket
      try {
        const pdfBuffer = await generateTicketPDF({
          ticketNumber: ticket.ticketNumber,
          qrCodeDataUrl: ticket.qrCodeDataUrl,
          eventDetails: eventDetails,
          customerName: customerName,
        });

        // Convert PDF buffer to base64 for email attachment
        const pdfBase64 = pdfBuffer.toString("base64");
        
        // Create descriptive filename
        let filename = `ticket-${ticket.ticketNumber}.pdf`;
        if (eventDetails?.event_title) {
          // Sanitize event title for filename (remove special chars)
          const sanitizedTitle = eventDetails.event_title
            .replace(/[^a-z0-9]/gi, "-")
            .toLowerCase()
            .substring(0, 30);
          filename = `${sanitizedTitle}-${ticket.ticketNumber}.pdf`;
        }
        
        pdfAttachments.push({
          filename: filename,
          content: pdfBase64,
        });
      } catch (pdfError) {
        console.error(`Error generating PDF for ticket ${ticket.ticketNumber}:`, pdfError);
        // Continue with other tickets even if one PDF fails
      }

      // Also attach QR code image for inline display in email
      const base64Data = ticket.qrCodeDataUrl.replace(
        /^data:image\/png;base64,/,
        ""
      );
      imageAttachments.push({
        filename: `qrcode${index}.png`,
        content: base64Data,
        content_id: `qrcode${index}`,
        disposition: "inline",
      });
    }

    // Combine PDF and image attachments
    const attachments = [...pdfAttachments, ...imageAttachments];

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
