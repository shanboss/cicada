"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { createStandardCheckout } from "../../actions/createCheckout";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [emailOptIn, setEmailOptIn] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) throw error;

      // Determine tiers: use ticket_tiers if available, fallback to legacy fields
      let eventTiers = [];
      if (data.ticket_tiers && Array.isArray(data.ticket_tiers) && data.ticket_tiers.length > 0) {
        eventTiers = data.ticket_tiers;
      } else if (data.stripe_price_id) {
        eventTiers = [
          {
            label: "General Admission",
            stripe_price_id: data.stripe_price_id,
            price: data.ticket_price || 0,
          },
        ];
      }

      if (eventTiers.length === 0) {
        alert("This event is not available for purchase");
        router.push("/events");
        return;
      }

      setTiers(eventTiers);
      setSelectedTierIndex(0);
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
      alert("Event not found");
      router.push("/events");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (newQuantity) => {
    setQuantity(Math.max(1, Math.min(10, parseInt(newQuantity) || 1)));
  };

  const handleCheckout = async () => {
    const selectedTier = tiers[selectedTierIndex];
    if (!selectedTier?.stripe_price_id) return;

    try {
      setProcessing(true);

      const checkoutUrl = await createStandardCheckout({
        priceId: selectedTier.stripe_price_id,
        eventId: String(event.id), // event.id is UUID (string)
        eventTitle: event.event_title,
        quantity: quantity,
        ticketType: selectedTier.label,
        emailOptIn,
      });

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Failed to create checkout. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  // Get price from selected tier
  const selectedTier = tiers[selectedTierIndex] || {};
  const pricePerTicket = selectedTier.price || 0;
  const subtotal = pricePerTicket * quantity;
  const tax = subtotal * 0; // Add tax if needed
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/events"
            className="text-purple-400 hover:text-purple-300 mb-4 inline-block"
          >
            ← Back to Events
          </Link>
          <h1 className="text-4xl font-bold">Checkout</h1>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Event Poster */}
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
              <Image
                src={event.image}
                alt={event.event_title}
                width={600}
                height={600}
                priority={true}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzIyMjtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMzMzO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMjIyO3N0b3Atb3BhY2l0eToxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg=="
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Right: Event Details & Order Summary */}
          <div className="space-y-6">
            {/* Event Details */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-bold mb-4">{event.event_title}</h2>

              <div className="space-y-3 text-gray-300">
                <div>
                  <p className="font-semibold">Date</p>
                  <p>
                    {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Time</p>
                  <p>
                    {new Date(`1970-01-01T${event.time}`).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Location</p>
                  <p>{event.location}</p>
                </div>

                {event.desc && (
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-sm whitespace-pre-wrap">{event.desc}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Type Selector (only if 2+ tiers) */}
            {tiers.length > 1 && (
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Select Ticket Type</h3>
                <select
                  value={selectedTierIndex}
                  onChange={(e) => setSelectedTierIndex(Number(e.target.value))}
                  disabled={processing}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  {tiers.map((tier, index) => (
                    <option key={index} value={index}>
                      {tier.label} — ${Number(tier.price).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Select Quantity</h3>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => updateQuantity(quantity - 1)}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-xl font-bold transition-colors"
                  disabled={processing}
                >
                  −
                </button>

                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => updateQuantity(e.target.value)}
                  className="w-24 text-center text-xl bg-black border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                  disabled={processing}
                />

                <button
                  onClick={() => updateQuantity(quantity + 1)}
                  className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-xl font-bold transition-colors"
                  disabled={processing}
                >
                  +
                </button>

                <span className="text-gray-400 ml-2">
                  {quantity === 1 ? "ticket" : "tickets"}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-3">
                Maximum 10 tickets per order
              </p>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-900 rounded-lg p-6 border border-purple-700">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Ticket Price</span>
                  <span>${pricePerTicket.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-300">
                  <span>Quantity</span>
                  <span>×{quantity}</span>
                </div>

                <div className="border-t border-gray-800 pt-3 flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-xl font-bold mb-2">
                    <span>Total (before tax)</span>
                    <span className="text-purple-400">${total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Final amount including applicable taxes will be shown at
                    Stripe checkout
                  </p>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer px-1">
              <input
                type="checkbox"
                checked={emailOptIn}
                onChange={(e) => setEmailOptIn(e.target.checked)}
                disabled={processing}
                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-300">
                Send me emails about upcoming Cicada events
              </span>
            </label>

            <p className="text-sm text-gray-500 text-center">
              You will be redirected to Stripe for secure payment
            </p>

            <p className="text-xs text-gray-400 text-center mt-4">
              By purchasing tickets you are agreeing to our{" "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-purple-400 underline hover:text-purple-300 cursor-pointer"
              >
                Terms and Conditions
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Buy Now Button */}
      <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 z-40">
        <button
          onClick={handleCheckout}
          disabled={processing}
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-purple-900/50"
        >
          {processing ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Buy Now - $${total.toFixed(2)}`
          )}
        </button>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 px-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full p-8 border border-purple-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">
              Terms and Conditions
            </h2>
            <div className="text-gray-300 space-y-4 mb-6">
              <p>
                This ticket grants admission for one (1) person only to the
                official pre and post party associated with the Snow Strippers
                concert. This is a 21+ event. A valid government-issued photo ID
                is required for entry, and the name on the ticket must match the
                attendee's ID. One ticket admits one person only; no sharing, no
                re-entry, and no exceptions. All sales are final. Tickets are
                non-refundable and non-transferable. The venue reserves the
                right to refuse entry for failure to comply with event policies.
                By purchasing this ticket, you agree to all event terms and
                conditions.
              </p>
            </div>
            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              I understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
