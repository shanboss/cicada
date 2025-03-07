"use client"; // Ensure it's a client component

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function EditEvent({ event, onEventUpdated, onClose }) {
  const [formData, setFormData] = useState({
    event_title: "",
    desc: "",
    date: "",
    time: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Pre-fill form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        event_title: event.event_title || "",
        desc: event.desc || "",
        date: event.date || "",
        time: event.time || "", // Ensure time is never undefined
        location: event.location || "",
      });
    }
  }, [event]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission for updating event
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { event_title, desc, date, location, time } = formData;

    if (!event_title || !desc || !date || !location) {
      setMessage("❌ All fields are required!");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("events")
        .update({ event_title, desc, date, location, time })
        .eq("id", event.id);

      if (error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage("✅ Event updated successfully!");
        setTimeout(() => {
          setMessage("");
          onClose(); // Close modal after success
          onEventUpdated(); // Refresh event list
        }, 1500);
      }
    } catch (err) {
      setMessage("❌ An unexpected error occurred.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-neutral-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-white">Edit Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-300">
              Event Title
            </label>
            <input
              name="event_title"
              type="text"
              value={formData.event_title}
              onChange={handleChange}
              required
              className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-300">
              Description
            </label>
            <textarea
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              required
              rows="3"
              className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-neutral-300">
              Location
            </label>
            <input
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              required
              className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-300">
              Date
            </label>
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-neutral-300">
              Time
            </label>
            <input
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-between">
            <button
              type="button"
              className="bg-gray-600 px-4 py-2 rounded-md text-white hover:bg-gray-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-500 px-4 py-2 rounded-md text-white hover:bg-indigo-400"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>

          {/* Success/Error Message */}
          {message && <p className="text-center mt-4 text-sm">{message}</p>}
        </form>
      </div>
    </div>
  );
}
