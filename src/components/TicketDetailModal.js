"use client";

import { useState } from "react";

export default function TicketDetailModal({ ticket, isOpen, onClose }) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !ticket) return null;

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/tickets/download-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.id }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Server error:", res.status, errBody);
        throw new Error(errBody.details || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-${ticket.ticket_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg max-w-md w-full border border-purple-700 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-gray-400 hover:text-white transition-colors bg-gray-900 bg-opacity-60 rounded-full w-8 h-8 flex items-center justify-center"
        >
          &times;
        </button>

        {/* Event poster */}
        {ticket.events?.image && (
          <img
            src={ticket.events.image}
            alt={ticket.events.event_title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        )}

        <div className="p-6">
          {/* Title + status */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-white">
              {ticket.events?.event_title || "Event"}
            </h2>
            {ticket.used ? (
              <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded-full text-xs ml-2 flex-shrink-0">
                Used
              </span>
            ) : (
              <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs ml-2 flex-shrink-0">
                Valid
              </span>
            )}
          </div>

          {/* Event details */}
          {ticket.events && (
            <div className="text-gray-400 text-sm space-y-1 mb-6">
              <p>Date: {ticket.events.date}</p>
              <p>Time: {ticket.events.time}</p>
              <p>Location: {ticket.events.location}</p>
            </div>
          )}

          {/* QR code */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white p-4 rounded-xl">
              <img
                src={ticket.qr_code_data}
                alt="Ticket QR Code"
                className="w-48 h-48"
              />
            </div>
            <p className="text-gray-500 text-xs mt-3">
              #{ticket.ticket_number}
            </p>
          </div>

          {/* Action buttons */}
          <div>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {downloading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
