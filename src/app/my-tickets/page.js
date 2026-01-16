"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUser(user);
      setEmail(user.email);
      fetchTickets(user.email);
    } else {
      // Not logged in - redirect to login
      setLoading(false);
    }
  };

  const fetchTickets = async (userEmail) => {
    try {
      setLoading(true);
      setError(null);

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

      if (fetchError) throw fetchError;

      setTickets(data || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Tickets</h1>

        {!user && (
          <div className="bg-gray-900 rounded-lg p-8 mb-8 text-center border border-purple-700">
            <h2 className="text-2xl font-semibold mb-4">Login Required</h2>
            <p className="text-gray-400 mb-6">
              Please log in to view your purchased tickets.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Log In
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              Don't have an account?{" "}
              <Link href="/signup" className="text-purple-400 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300">Error: {error}</p>
          </div>
        )}

        {tickets.length === 0 && !loading && email && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No Tickets Found</h2>
            <p className="text-gray-400 mb-6">
              No tickets found for {email}. Check your email address or browse
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

        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-700 transition-colors"
            >
              <div className="md:flex">
                {/* Event Image */}
                {ticket.events?.image && (
                  <div className="md:w-1/3">
                    <img
                      src={ticket.events.image}
                      alt={ticket.events.event_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Ticket Details */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        {ticket.events?.event_title || "Event"}
                      </h3>
                      {ticket.events && (
                        <div className="text-gray-400 space-y-1">
                          <p>Date: {ticket.events.date}</p>
                          <p>Time: {ticket.events.time}</p>
                          <p>Location: {ticket.events.location}</p>
                        </div>
                      )}
                    </div>
                    {ticket.used ? (
                      <span className="px-3 py-1 bg-gray-700 text-gray-400 rounded-full text-sm">
                        Used
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                        Valid
                      </span>
                    )}
                  </div>

                  {/* QR Code */}
                  <div className="mt-4 p-4 bg-white rounded-lg inline-block">
                    <img
                      src={ticket.qr_code_data}
                      alt="Ticket QR Code"
                      className="w-40 h-40"
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-500">
                      Ticket #: {ticket.ticket_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      Purchased:{" "}
                      {new Date(ticket.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
