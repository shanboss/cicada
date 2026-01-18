"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import CheckBox from "./CheckBox";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone_number: "",
    password: "",
    verifyPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Single change handler for all inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const {
      email,
      firstName,
      lastName,
      phone_number,
      password,
      verifyPassword,
    } = formData;

    // Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Invalid email address! Please enter a valid email.");
      setLoading(false);
      return;
    }

    // Validate Password
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    // Validate Password Match
    if (password !== verifyPassword) {
      setMessage("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone_number: phone_number || null,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) {
        console.error("Auth Error:", authError.message);
        setMessage("Error: " + authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setMessage("Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      // Insert into profiles table (trigger should handle this, but doing it manually as fallback)
      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          phone_number: phone_number || null,
        },
      ]);

      if (insertError && insertError.code !== "23505") {
        // Ignore duplicate key errors (profile might already exist from trigger)
        console.error("Profiles Insert Error:", insertError.message);
        // Don't fail the registration if profile insert fails (trigger might have already created it)
      }

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        // Email confirmation required
        setMessage(
          "Account created! Please check your email to confirm your account before signing in."
        );
      } else {
        // User is automatically signed in (if email confirmation is disabled)
        setMessage("Account created successfully! Redirecting to home...");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      setMessage("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8 bg-neutral-900 text-neutral-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="text-center text-4xl font-bold tracking-tight">
          JOIN CICADA
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl bg-neutral-800 p-6 rounded-lg shadow-lg">
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

          {/* Phone Number (Optional) */}
          <div>
            <label
              htmlFor="phone_number"
              className="block text-sm font-medium text-neutral-300"
            >
              Phone Number (Optional)
            </label>
            <div className="mt-2">
              <input
                id="phone_number"
                name="phone_number"
                type="text"
                autoComplete="tel"
                value={formData.phone_number}
                onChange={handleChange}
                className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-300"
            >
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Verify Password */}
          <div>
            <label
              htmlFor="verifyPassword"
              className="block text-sm font-medium text-neutral-300"
            >
              Verify Password
            </label>
            <div className="mt-2">
              <input
                id="verifyPassword"
                name="verifyPassword"
                type="password"
                required
                autoComplete="new-password"
                value={formData.verifyPassword}
                onChange={handleChange}
                className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Create Account"}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-4">
            <Link
              href="/signin"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Already have an account?{" "}
              <span className="underline">Sign In</span>
            </Link>
          </div>

          {/* Success/Error Message */}
          {message && <p className="text-center mt-4 text-sm">{message}</p>}
        </form>
      </div>
    </div>
  );
}
