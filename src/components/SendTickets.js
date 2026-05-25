"use client";

import React, { useState, useEffect } from "react";

export default function SendTickets({ events = [] }) {
  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ticketData, setTicketData] = useState(null);

  // Default to the latest event (first in list, already sorted by date desc)
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  // Build tiers for the selected event
  const tiers = (() => {
    if (!selectedEvent) return [];
    if (
      selectedEvent.ticket_tiers &&
      Array.isArray(selectedEvent.ticket_tiers) &&
      selectedEvent.ticket_tiers.length > 0
    ) {
      return selectedEvent.ticket_tiers;
    }
    if (selectedEvent.stripe_price_id || selectedEvent.ticket_price) {
      return [
        {
          label: "General Admission",
          stripe_price_id: selectedEvent.stripe_price_id,
          price: selectedEvent.ticket_price || 0,
        },
      ];
    }
    return [];
  })();

  // Reset tier selection when event changes
  useEffect(() => {
    setSelectedTierIndex(0);
  }, [selectedEventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setTicketData(null);

    const ticketType = tiers[selectedTierIndex]?.label || null;

    try {
      const response = await fetch("/api/admin/generate-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          customerName: customerName || null,
          eventId: selectedEventId || null,
          ticketType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate ticket");
      }

      setTicketData(data);
      setSuccess(true);
      setEmail("");
      setCustomerName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-2">Generate Admin QR Code</h2>
      <p className="text-neutral-400 mb-6">
        Create a ticket without requiring a purchase. Enter the customer email
        to generate a QR code.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-neutral-800 p-6 rounded-lg shadow-md mb-6"
      >
        {/* Event Selection */}
        <div className="mb-4">
          <label
            htmlFor="send-event"
            className="block text-sm font-medium text-neutral-400 mb-2"
          >
            Event *
          </label>
          <select
            id="send-event"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full p-2 bg-neutral-700 rounded text-white"
            required
          >
            {events.length === 0 && (
              <option value="">No events available</option>
            )}
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.event_title} — {ev.date}
              </option>
            ))}
          </select>
        </div>

        {/* Ticket Tier Selection (only if 2+ tiers) */}
        {tiers.length > 1 && (
          <div className="mb-4">
            <label
              htmlFor="send-tier"
              className="block text-sm font-medium text-neutral-400 mb-2"
            >
              Ticket Type *
            </label>
            <select
              id="send-tier"
              value={selectedTierIndex}
              onChange={(e) => setSelectedTierIndex(Number(e.target.value))}
              className="w-full p-2 bg-neutral-700 rounded text-white"
            >
              {tiers.map((tier, index) => (
                <option key={index} value={index}>
                  {tier.label} — ${Number(tier.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Show single tier as info text */}
        {tiers.length === 1 && tiers[0].label && (
          <div className="mb-4 p-3 bg-neutral-700/50 rounded text-neutral-300 text-sm">
            Ticket type: <strong>{tiers[0].label}</strong>
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="send-email"
            className="block text-sm font-medium text-neutral-400 mb-2"
          >
            Customer Email *
          </label>
          <input
            type="email"
            id="send-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 bg-neutral-700 rounded text-white"
            required
            placeholder="customer@example.com"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="send-customerName"
            className="block text-sm font-medium text-neutral-400 mb-2"
          >
            Customer Name (Optional)
          </label>
          <input
            type="text"
            id="send-customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full p-2 bg-neutral-700 rounded text-white"
            placeholder="John Doe"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || events.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white py-2 rounded font-semibold"
        >
          {loading ? "Generating..." : "Generate QR Code"}
        </button>
      </form>

      {success && ticketData && (
        <div className="bg-neutral-800 p-6 rounded-lg shadow-md">
          <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded text-green-400">
            Ticket generated successfully!
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Ticket Details</h3>
            <p className="text-neutral-400">
              <strong>Ticket Number:</strong> {ticketData.ticket_number}
            </p>
            <p className="text-neutral-400">
              <strong>Customer Email:</strong> {ticketData.customer_email}
            </p>
            {ticketData.customer_name && (
              <p className="text-neutral-400">
                <strong>Customer Name:</strong> {ticketData.customer_name}
              </p>
            )}
            {ticketData.ticket_type && (
              <p className="text-neutral-400">
                <strong>Ticket Type:</strong>{" "}
                <span className="text-purple-400 font-semibold">
                  {ticketData.ticket_type}
                </span>
              </p>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">QR Code</h3>
            <div className="flex justify-center bg-white p-4 rounded">
              <img
                src={ticketData.qr_code_data}
                alt="QR Code"
                className="max-w-full h-auto"
              />
            </div>
          </div>

          <div className="text-sm text-neutral-500 mt-4">
            <p>
              You can download or screenshot this QR code to share with the
              customer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
