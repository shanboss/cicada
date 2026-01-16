import QRCode from "qrcode";

/**
 * Generate a unique ticket number
 */
export function generateTicketNumber() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `CICADA-${timestamp}-${randomStr}`.toUpperCase();
}

/**
 * Generate QR code as data URL
 * @param {string} ticketNumber - The unique ticket number
 * @returns {Promise<string>} - Data URL of the QR code
 */
export async function generateQRCode(ticketNumber) {
  try {
    const qrDataUrl = await QRCode.toDataURL(ticketNumber, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 400,
    });
    return qrDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

/**
 * Verify a ticket number format
 * @param {string} ticketNumber
 * @returns {boolean}
 */
export function isValidTicketNumber(ticketNumber) {
  return /^CICADA-[A-Z0-9]+-[A-Z0-9]+$/.test(ticketNumber);
}

