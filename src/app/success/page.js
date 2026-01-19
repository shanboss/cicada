"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [sessionData, setSessionData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("error");
      setError("No session ID found");
      return;
    }

    // Fetch session status from your API
    const fetchSessionStatus = async () => {
      try {
        const response = await fetch(
          `/api/checkout-session?session_id=${sessionId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch session");
        }

        const data = await response.json();
        setSessionData(data);

        if (data.status === "complete") {
          setStatus("success");
          // Fetch ticket from database
          fetchTicket(sessionId);
        } else if (data.status === "open") {
          setStatus("processing");
        } else {
          setStatus("error");
          setError("Payment was not successful");
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setStatus("error");
        setError(err.message);
      }
    };

    // Fetch tickets with retry logic (webhook might still be processing)
    const fetchTicket = async (sessionId, retryCount = 0) => {
      try {
        console.log(`🔍 Fetching tickets for session: ${sessionId} (attempt ${retryCount + 1})`);
        
        const response = await fetch(
          `/api/tickets?session_id=${sessionId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch tickets: ${response.statusText}`);
        }

        const result = await response.json();
        const ticketsData = result.tickets || [];

        if (!ticketsData || ticketsData.length === 0) {
          // If tickets not found and we haven't retried too many times, try again
          if (retryCount < 10) {
            console.log(`⏳ No tickets found yet, retrying in 2 seconds... (${retryCount + 1}/10)`);
            setTimeout(() => fetchTicket(sessionId, retryCount + 1), 2000);
          } else {
            console.error("❌ Tickets not found after 10 retries");
            setError("Tickets are still being generated. Please check your email or try refreshing the page.");
          }
          return;
        }

        console.log(`✅ Found ${ticketsData.length} ticket(s)`);
        setTickets(ticketsData);
      } catch (err) {
        console.error("❌ Error fetching tickets:", err);
        if (retryCount < 10) {
          setTimeout(() => fetchTicket(sessionId, retryCount + 1), 2000);
        } else {
          setError(err.message || "Failed to fetch tickets");
        }
      }
    };

    fetchSessionStatus();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Processing your order...</h1>
            <p className="text-gray-400">Please wait while we confirm your payment.</p>
          </div>
        )}

        {status === "processing" && (
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Processing</h1>
            <p className="text-gray-400 mb-6">
              Your payment is being processed. This page will update automatically.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Refresh Status
            </button>
          </div>
        )}

        {status === "success" && (
          <div className="bg-gray-900 rounded-lg p-8 text-center border border-green-500">
            <h1 className="text-3xl font-bold mb-4 text-green-400">
              Payment Successful! 🎉
            </h1>
            <p className="text-gray-300 mb-6">
              Thank you for your purchase! Your {tickets.length > 1 ? `${tickets.length} tickets have` : 'ticket has'} been sent to your email.
            </p>
            
            {sessionData?.customer_email && (
              <div className="bg-black rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400 mb-1">Confirmation sent to:</p>
                <p className="text-white font-semibold">{sessionData.customer_email}</p>
              </div>
            )}

            {/* Display QR Codes if available */}
            {tickets.length > 0 ? (
              <div className="bg-black rounded-lg p-6 mb-6 border border-purple-700">
                <h3 className="text-xl font-semibold mb-4">Your {tickets.length > 1 ? `${tickets.length} Tickets` : 'Ticket'}</h3>
                
                {tickets[0]?.events && (
                  <div className="mb-6 text-left bg-purple-900 bg-opacity-30 rounded-lg p-4">
                    <p className="text-lg font-semibold text-white">{tickets[0].events.event_title}</p>
                    <p className="text-sm text-gray-300 mt-2">Date: {tickets[0].events.date}</p>
                    <p className="text-sm text-gray-300">Time: {tickets[0].events.time}</p>
                    <p className="text-sm text-gray-300">Location: {tickets[0].events.location}</p>
                  </div>
                )}

                {tickets.length > 1 && (
                  <div className="bg-purple-900 bg-opacity-30 rounded-lg p-3 mb-4 border border-purple-700">
                    <p className="text-sm text-purple-300"><strong>Tip:</strong> Each person can use their own QR code for entry</p>
                  </div>
                )}

                <div className={`grid ${tickets.length > 1 ? 'grid-cols-1 md:grid-cols-2 gap-6' : 'grid-cols-1'}`}>
                  {tickets.map((ticket, index) => (
                    <div key={ticket.id} className="bg-gray-900 rounded-lg p-4">
                      {tickets.length > 1 && (
                        <p className="text-purple-400 font-semibold mb-3 text-center">Ticket {index + 1}</p>
                      )}
                      <div className="bg-white rounded-lg p-4 inline-block mb-3">
                        <img
                          src={ticket.qr_code_data}
                          alt={`Ticket ${index + 1} QR Code`}
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-center">{ticket.ticket_number}</p>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-purple-300 font-semibold mt-4">
                  Screenshot {tickets.length > 1 ? 'these QR codes' : 'this QR code'} or check your email!
                </p>
              </div>
            ) : (
              <div className="bg-black rounded-lg p-4 mb-6 border border-yellow-600">
                <p className="text-sm text-yellow-300">
                  Generating your ticket(s)... This will appear shortly!
                </p>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                {tickets.length > 0
                  ? `Screenshot your QR code${tickets.length > 1 ? 's' : ''} above or check your email for a copy.`
                  : "Please check your email (including spam folder) for your ticket(s) with QR code(s)."}
              </p>
              
              <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-700">
                <h3 className="font-semibold mb-2">What's Next?</h3>
                <ul className="text-sm text-gray-300 space-y-2 text-left">
                  <li>{tickets.length > 0 ? `Screenshot the QR code${tickets.length > 1 ? 's' : ''} above` : "Check your email for your ticket(s)"}</li>
                  <li>Save your ticket{tickets.length > 1 ? 's' : ''} for the event</li>
                  <li>Present QR code at the event entrance</li>
                  {tickets.length > 1 && <li>Each person uses their own QR code</li>}
                </ul>
              </div>

              <div className="flex gap-4 justify-center mt-6">
                <Link
                  href="/events"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Browse Events
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="bg-gray-900 rounded-lg p-8 text-center border border-red-500">
            <h1 className="text-3xl font-bold mb-4 text-red-400">
              Something Went Wrong
            </h1>
            <p className="text-gray-300 mb-6">
              {error || "There was an issue processing your payment."}
            </p>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Please contact support if you were charged but didn't receive your ticket.
              </p>

              <div className="flex gap-4 justify-center mt-6">
                <Link
                  href="/events"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Try Again
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Success() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
