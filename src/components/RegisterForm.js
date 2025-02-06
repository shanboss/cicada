"use client"; // Ensure it's a client component

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import CheckBox from "./CheckBox";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    subscribed: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    console.log("this changed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { email, firstName, lastName, subscribed } = formData;

    // Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Invalid email address! Please enter a valid email. 🚫");
      setLoading(false);
      return;
    }

    try {
      // Insert into Supabase
      const { error } = await supabase
        .from("subscribers")
        .insert([
          { email, first_name: firstName, last_name: lastName, subscribed },
        ]);

      if (error) {
        if (error.code === "23505") {
          setMessage("This email is already registered! 🚫");
        } else {
          console.error("Supabase Insert Error:", error.message);
          setMessage("Error: " + error.message);
        }
        setLoading(false);
        return;
      }

      // Send welcome email
      const emailResponse = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName }),
      });

      if (emailResponse.ok) {
        setMessage("Successfully registered! 🎉 Check your email.");
      } else {
        const errorData = await emailResponse.json();
        console.error("Email Error:", errorData.error);
        setMessage("Registered, but failed to send email.");
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      setMessage("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8 bg-neutral-900 text-neutral-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-4xl font-bold tracking-tight">
          JOIN CICADA
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md bg-neutral-800 p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-300"
            >
              Email Address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Name Fields */}
          <div className="flex flex-row items-center justify-center gap-x-4">
            <div className="w-1/2">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-neutral-300"
              >
                First Name
              </label>
              <div className="mt-2">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="w-1/2">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-neutral-300"
              >
                Last Name
              </label>
              <div className="mt-2">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Checkbox */}
          <CheckBox
            label="Sign up for our mailing list"
            description="Get notified about upcoming events"
            checked={formData.subscribed}
            onChange={handleChange}
            name="subscribed"
          />

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>

          {/* Success/Error Message */}
          {message && <p className="text-center mt-4 text-sm">{message}</p>}
        </form>
      </div>
    </div>
  );
}
