"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Single change handler for all inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { email, password } = formData;

    // Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Invalid email address! Please enter a valid email.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes("Invalid login credentials")) {
          setMessage("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          setMessage(
            "Please check your email and confirm your account before signing in."
          );
        } else {
          setMessage("Error: " + error.message);
        }
        setLoading(false);
        return;
      }

      // Check if sign in was successful
      if (data.user && data.session) {
        // Success message
        setMessage("Sign in successful! Redirecting...");

        // Wait 1 second, then navigate to home
        setTimeout(() => {
          router.push("/");
          router.refresh(); // Refresh to update auth state
        }, 1000);
      } else {
        setMessage("Sign in failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      setMessage("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setMessage("Invalid email address! Please enter a valid email.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage("Error: " + error.message);
        setLoading(false);
        return;
      }

      setMessage(
        "Password reset email sent! Please check your inbox for instructions."
      );
      setShowForgotPassword(false);
      setResetEmail("");
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
          SIGN IN
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl bg-neutral-800 p-6 rounded-lg shadow-lg">
        {!showForgotPassword ? (
          <form onSubmit={handleSignIn} className="space-y-6">
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
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-indigo-400 hover:text-indigo-300 underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-4">
              <Link
                href="/signup"
                className="text-sm text-indigo-400 hover:text-indigo-300 underline"
              >
                Don't have an account? Sign Up
              </Link>
            </div>

            {/* Success/Error Message */}
            {message && <p className="text-center mt-4 text-sm">{message}</p>}
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Reset Password
              </h3>
              <p className="text-sm text-neutral-400 mb-4">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="resetEmail"
                className="block text-sm font-medium text-neutral-300"
              >
                Email Address
              </label>
              <div className="mt-2">
                <input
                  id="resetEmail"
                  name="resetEmail"
                  type="email"
                  required
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
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
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>

            {/* Back to Sign In */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                  setMessage("");
                }}
                className="text-sm text-indigo-400 hover:text-indigo-300 underline"
              >
                Back to Sign In
              </button>
            </div>

            {/* Success/Error Message */}
            {message && <p className="text-center mt-4 text-sm">{message}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

