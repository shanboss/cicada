"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    fetchTickets(user.email);
  }, [user, authLoading]);

  const fetchTickets = async (userEmail) => {
    try {
      setLoading(true);
      setError(null);

      if (!userEmail) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("tickets")
        .select(
          `
          *,
          events (
            event_title,
            date,
            time,
            location,
            image
          )
        `
        )
        .eq("customer_email", userEmail)
        .order("purchase_date", { ascending: false });

      if (fetchError) {
        console.error("Error fetching tickets:", fetchError);
        throw fetchError;
      }

      setTickets(data || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err.message || "Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Show sign in/sign up prompt if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 border border-purple-700 text-center">
          <h1 className="text-3xl font-bold mb-4">My Tickets</h1>
          <p className="text-gray-400 mb-8">
            Please sign in or create an account to view your tickets. Tickets
            purchased with your email will appear here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signin"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Tickets</h1>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300">Error: {error}</p>
          </div>
        )}

        {tickets.length === 0 && !loading && user?.email && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No Tickets Found</h2>
            <p className="text-gray-400 mb-6">
              No tickets found for {user.email}. Check your email address or browse
              upcoming events.
            </p>
            <Link
              href="/events"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Browse Events
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => {
            const handleSaveQR = () => {
              // Create a link element to download the QR code
              const link = document.createElement("a");
              link.href = ticket.qr_code_data;
              link.download = `ticket-${ticket.ticket_number}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <div
                key={ticket.id}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-700 transition-colors aspect-square flex flex-col relative group"
              >
                {/* Event Image */}
                {ticket.events?.image && (
                  <div className="w-full h-32 flex-shrink-0">
                    <img
                      src={ticket.events.image}
                      alt={ticket.events.event_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Ticket Details */}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold line-clamp-2 flex-1">
                      {ticket.events?.event_title || "Event"}
                    </h3>
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

                  {ticket.events && (
                    <div className="text-gray-400 text-xs space-y-0.5 mb-3">
                      <p className="truncate">Date: {ticket.events.date}</p>
                      <p className="truncate">Time: {ticket.events.time}</p>
                      <p className="truncate">
                        Location: {ticket.events.location}
                      </p>
                    </div>
                  )}

                  <div className="mt-auto pt-3 border-t border-gray-800 text-xs text-gray-500">
                    <p className="truncate">#{ticket.ticket_number}</p>
                    <p>{new Date(ticket.purchase_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Save Button - Shows on Hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={handleSaveQR}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                  >
                    Save
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
