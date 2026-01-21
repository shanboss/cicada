"use client";

import React, { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminGenerateQRPage() {
  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();

  // Check if user is admin
  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/admin");
          return;
        }

        setUser(session.user);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_role")
          .eq("id", session.user.id)
          .single();

        const isUserAdmin = 
          (profile && profile.user_role === "admin") ||
          session.user.user_metadata?.role === "admin";

        setIsAdmin(isUserAdmin);

        if (!isUserAdmin) {
          router.push("/admin");
        }
      } catch (err) {
        console.error("Error checking admin:", err);
        router.push("/admin");
      }
    };

    checkAdmin();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setTicketData(null);

    try {
      const response = await fetch("/api/admin/generate-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          customerName: customerName || null,
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

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col mt-12 items-center px-6 py-12 bg-neutral-900 text-neutral-300">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col mt-12 items-center px-6 py-12 bg-neutral-900 text-neutral-300">
      <div className="w-full max-w-2xl">
        <Link
          href="/admin"
          className="text-indigo-400 hover:text-indigo-300 underline mb-6 inline-block"
        >
          ← Back to Admin Dashboard
        </Link>

        <h1 className="text-4xl font-bold mb-8">Generate Admin QR Code</h1>
        <p className="text-neutral-400 mb-6">
          Create a ticket without requiring a purchase. Enter the customer email to generate a QR code.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral-800 p-6 rounded-lg shadow-md mb-6"
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-400 mb-2"
            >
              Customer Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-neutral-700 rounded text-white"
              required
              placeholder="customer@example.com"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="customerName"
              className="block text-sm font-medium text-neutral-400 mb-2"
            >
              Customer Name (Optional)
            </label>
            <input
              type="text"
              id="customerName"
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
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white py-2 rounded font-semibold"
          >
            {loading ? "Generating..." : "Generate QR Code"}
          </button>
        </form>

        {success && ticketData && (
          <div className="bg-neutral-800 p-6 rounded-lg shadow-md">
            <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded text-green-400">
              ✅ Ticket generated successfully!
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
              <p>You can download or screenshot this QR code to share with the customer.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
