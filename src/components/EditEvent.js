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
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Pre-fill form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        event_title: event.event_title || "",
        desc: event.desc || "",
        date: event.date || "",
        time: event.time || "",
        location: event.location || "",
      });
    }
  }, [event]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files.length > 0) {
      setFile(files[0]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission for updating event
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { event_title, desc, date, location, time } = formData;
    if (!event_title || !desc || !date || !location || !time) {
      setMessage("❌ All fields are required!");
      setLoading(false);
      return;
    }

    // Default to existing image URL if no new file is selected
    let image = event.image || "";

    // If a new image file is provided, upload it to the "private" folder in your Supabase Storage bucket
    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      // Include the "private" folder in the file path
      const filePath = `private/${fileName}`;

      // Upload file to Supabase Storage bucket "images"
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) {
        setMessage(`❌ Error uploading image: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      // Retrieve the public URL for the uploaded file
      const { publicURL, error: urlError } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      if (urlError || !publicURL) {
        // Fallback: Manually construct the URL if getPublicUrl returns empty
        image = `https://towexkhijugmytktakxd.supabase.co/storage/v1/object/public/images/${filePath}`;
      } else {
        image = publicURL;
      }
    }

    try {
      // Update the event record with the new data and image URL
      const { error } = await supabase
        .from("events")
        .update({ event_title, desc, date, location, time, image })
        .eq("id", event.id);

      if (error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage("✅ Event updated successfully!");
        setTimeout(() => {
          setMessage("");
          onClose(); // Hide the edit section after success
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
    <section className="bg-neutral-800 p-6 rounded-lg shadow-lg w-full my-4 max-w-md md:max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-white">Edit Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Two-column grid for the input fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Event Title, Description, Location */}
          <div className="space-y-4">
            {/* Event Title */}
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
          </div>
          {/* Right Column: Date, Time, Image */}
          <div className="space-y-4">
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
            {/* File Input for New Image */}
            <div>
              <label className="block text-sm font-medium text-neutral-300">
                Upload New Image
                {event.image && (
                  <div className="flex flex-col items-center my-2">
                    <p className="text-sm text-neutral-300">Current Image:</p>
                    <img
                      src={event.image}
                      alt={event.event_title}
                      className="w-[5rem] mt-2 rounded"
                    />
                  </div>
                )}
              </label>
              <input
                name="image"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit and Cancel Buttons */}
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
    </section>
  );
}
