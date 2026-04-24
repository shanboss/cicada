"use client";

import React, { useState, useEffect } from "react";
import AddEvent from "@/components/AddEvent";
import EditEvent from "@/components/EditEvent";
import AdminSidebar from "@/components/AdminSidebar";
import SendTickets from "@/components/SendTickets";
import PurchaseAnalysis from "@/components/PurchaseAnalysis";
import EventsTable from "@/components/EventsTable";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("events");

  // Fetch events from Supabase
  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
  };

  // Dev-only auto-login with admin credentials from env vars
  const handleDevLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
    });
    if (error) {
      setError(error.message);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col mt-12 items-center justify-center px-6 py-12 bg-neutral-900 text-neutral-300">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Login form or access denied — keep centered layout
  if (!user || (user && !isAdmin)) {
    return (
      <div className="flex min-h-screen flex-col mt-12 items-center px-6 py-12 bg-neutral-900 text-neutral-300">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>

        {user && !isAdmin ? (
          <div className="mt-6 w-full max-w-2xl bg-red-900/20 border border-red-500 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-red-400">
              Access Denied
            </h2>
            <p className="text-neutral-300">
              You do not have permission to access this page. Admin role
              required.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-indigo-400 hover:text-indigo-300 underline"
            >
              Return to Home
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleLogin}
            className="mt-6 w-full max-w-md bg-neutral-800 p-6 rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Admin Login
            </h2>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-400"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 mt-1 bg-neutral-700 rounded text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-400"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mt-1 bg-neutral-700 rounded text-white"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded"
            >
              Login
            </button>

            {process.env.NODE_ENV === "development" && (
              <button
                type="button"
                onClick={handleDevLogin}
                className="w-full mt-3 bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded"
              >
                Dev Login
              </button>
            )}
          </form>
        )}
      </div>
    );
  }

  // Authenticated admin — sidebar layout
  return (
    <div className="flex min-h-screen bg-neutral-900 text-neutral-300">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 mt-12 px-4 md:px-8 py-8 md:py-12 pb-20 md:pb-12 overflow-auto">
        {editingEvent && (
          <EditEvent
            event={editingEvent}
            onEventUpdated={fetchEvents}
            onClose={() => setEditingEvent(null)}
          />
        )}

        {activeTab === "events" && (
          <>
            <h1 className="text-2xl md:text-4xl font-bold mb-6">Events</h1>

            {/* Admin Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <AddEvent onEventAdded={fetchEvents} />
              <Link
                href="/verify"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
              >
                Verify Tickets
              </Link>
            </div>

            <EventsTable
              events={events}
              loading={loading}
              onEdit={setEditingEvent}
            />
          </>
        )}

        {activeTab === "send-tickets" && <SendTickets />}

        {activeTab === "purchase-analysis" && <PurchaseAnalysis />}
      </main>
    </div>
  );
}
