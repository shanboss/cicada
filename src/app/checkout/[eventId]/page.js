"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { createStandardCheckout } from "../../actions/createCheckout";
import Link from "next/link";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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

      if (!data.stripe_price_id) {
        alert("This event is not available for purchase");
        router.push("/events");
        return;
      }

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
    if (!event?.stripe_price_id) return;

    try {
      setProcessing(true);

      const checkoutUrl = await createStandardCheckout({
        priceId: event.stripe_price_id,
        eventId: event.id.toString(),
        eventTitle: event.event_title,
        quantity: quantity,
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

  // Get price from event data, fallback to 0 if not set
  const pricePerTicket = event.ticket_price || 0;
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
              <img
                src={event.image}
                alt={event.event_title}
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

            {/* Buy Now Button */}
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
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
