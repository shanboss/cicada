"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AddEvent({ onEventAdded }) {
  const [formData, setFormData] = useState({
    event_title: "",
    desc: "",
    date: "",
    location: "",
    time: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Modal state
  const [file, setFile] = useState(null); // Image File State

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files.length) {
      setFile(files[0]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Submit event to Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { event_title, desc, date, location, time, payment_link } = formData;
    if (!event_title || !desc || !date || !location || !time) {
      setMessage("❌ All fields are required!");
      setLoading(false);
      return;
    }

    let image = "";
    if (file) {
      // Generate a unique filename
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
        // Fallback: manually construct the URL if getPublicUrl returns empty
        image = `https://towexkhijugmytktakxd.supabase.co/storage/v1/object/public/images/${filePath}`;
      } else {
        image = publicURL;
      }
    }

    try {
      // Insert the event record with the image URL
      const { error } = await supabase
        .from("events")
        .insert([
          { event_title, desc, date, time, location, image, payment_link },
        ]);

      if (error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage("✅ Event added successfully!");
        setFormData({
          event_title: "",
          desc: "",
          date: "",
          location: "",
          time: "",
          payment_link: "",
        });
        setFile(null); // Reset file input
        setTimeout(() => {
          setMessage("");
          setIsOpen(false);
          onEventAdded(); // Refresh event list if needed
        }, 1500);
      }
    } catch (err) {
      setMessage("❌ An unexpected error occurred.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Add Event Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-md shadow-md hover:bg-indigo-400 transition"
      >
        <span>Add Event</span>
        <span className="text-lg font-bold">+</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-white">Create Event</h2>
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
                  className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-neutral-300">
                  Location
                </label>
                <input
                  name="location"
                  type="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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

              {/* Payment Link */}
              <div>
                <label className="block text-sm font-medium text-neutral-300">
                  Payment Link
                </label>
                <input
                  name="payment_link"
                  type="payment_link"
                  value={formData.payment_link}
                  onChange={handleChange}

                  className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Upload Image */}
              <div>
                <label className="block text-sm font-medium text-neutral-300">
                  Upload Image
                </label>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-between">
                <button
                  type="button"
                  className="bg-gray-600 px-4 py-2 rounded-md text-white hover:bg-gray-500"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-500 px-4 py-2 rounded-md text-white hover:bg-indigo-400"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>

              {/* Success/Error Message */}
              {message && <p className="text-center mt-4 text-sm">{message}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
