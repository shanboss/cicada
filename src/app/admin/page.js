"use client";

import React, { useState, useEffect } from "react";
import AddEvent from "@/components/AddEvent";
import { supabase } from "../../../lib/supabaseClient";
import { TrashIcon } from "@heroicons/react/24/solid";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]); // State to store events
  const [loading, setLoading] = useState(true); // State for loading status
  const [isAdmin, setIsAdmin] = useState(false); // State to check admin status
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [error, setError] = useState(""); // State for error message

  // Fetch events from Supabase
  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data);
    }
    setLoading(false);
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear any existing error messages

    // Check if password is correct (hardcoded to 123456 for testing)
    if (password !== "123456") {
      setError("Invalid password");
      return;
    }

    // Fetch the role from the 'subscribers' table using email
    const { data: userData, error: userError } = await supabase
      .from("subscribers")
      .select("role")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      setError("Invalid email or user not found");
      return;
    }

    // Check if the role is admin
    if (userData.role === "admin") {
      setIsAdmin(true);
      fetchEvents(); // Fetch events if the user is an admin
    } else {
      setError("You do not have admin privileges");
    }
  };

  // Handle event deletion
  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      console.error("Error deleting event:", error);
    } else {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col mt-12 items-center px-6 py-12 bg-neutral-900 text-neutral-300">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>

      {!isAdmin ? (
        <form
          onSubmit={handleLogin}
          className="mt-6 w-full max-w-md bg-neutral-800 p-6 rounded-lg shadow-md"
        >
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Admin Login
          </h2>

          {/* Email Input */}
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

          {/* Password Input */}
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

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded"
          >
            Login
          </button>
        </form>
      ) : (
        <>
          {/* Add Event Button & Modal */}
          <div className="mt-6">
            <AddEvent onEventAdded={fetchEvents} />
          </div> 

          {/* Events List */}
          <div className="mt-8 w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-4">Current Events</h2>

            {loading ? (
              <p>Loading events...</p>
            ) : events.length === 0 ? (
              <p>No events available.</p>
            ) : (
              <ul className="space-y-4">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="flex justify-between items-center p-4 bg-neutral-800 rounded-lg shadow-md"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {event.event_title}
                      </h3>
                      <h3 className="text-lg font-regular text-white">
                        {event.location}
                      </h3>
                      <p className="text-neutral-400">{event.desc}</p>
                      <p className="text-sm text-neutral-500 mt-1">
                        📅 {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="ml-4 p-2 bg-red-600 rounded-full hover:bg-red-500 transition"
                      title="Delete Event"
                    >
                      <TrashIcon className="h-5 w-5 text-white" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
