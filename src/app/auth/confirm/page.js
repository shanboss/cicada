"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import Link from "next/link";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing"); // 'processing', 'success', 'error'
  const [message, setMessage] = useState("Confirming your email...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check for hash fragments in URL (Supabase email confirmation)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");
        const errorParam = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        // Check for query parameters (alternative format)
        const token = searchParams.get("token");
        const tokenHash = searchParams.get("token_hash");
        const typeQuery = searchParams.get("type");

        // Handle error from URL
        if (errorParam || errorDescription) {
          setStatus("error");
          setError(errorDescription || errorParam || "An error occurred during email confirmation.");
          setMessage("Email confirmation failed");
          return;
        }

        // If we have an access token in hash, Supabase has already confirmed
        if (accessToken && type === "email") {
          // Set the session
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || "",
          });

          if (sessionError) {
            throw sessionError;
          }

          if (data?.session) {
            setStatus("success");
            setMessage("Email confirmed successfully! Welcome to Cicada.");
            
            // Redirect to home after 2 seconds
            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 2000);
          } else {
            throw new Error("Failed to create session");
          }
        }
        // Handle token_hash confirmation (newer Supabase format)
        else if (tokenHash && typeQuery === "email") {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "email",
          });

          if (verifyError) {
            throw verifyError;
          }

          if (data?.session) {
            setStatus("success");
            setMessage("Email confirmed successfully! Welcome to Cicada.");
            
            // Redirect to home after 2 seconds
            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 2000);
          } else {
            throw new Error("Failed to verify email");
          }
        }
        // Handle token confirmation (older format)
        else if (token) {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token: token,
            type: "email",
          });

          if (verifyError) {
            throw verifyError;
          }

          if (data?.session) {
            setStatus("success");
            setMessage("Email confirmed successfully! Welcome to Cicada.");
            
            // Redirect to home after 2 seconds
            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 2000);
          } else {
            throw new Error("Failed to verify email");
          }
        }
        // No confirmation parameters found
        else {
          // Check if user is already confirmed by checking current session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            setStatus("success");
            setMessage("Your email is already confirmed!");
            
            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 2000);
          } else {
            setStatus("error");
            setError("No confirmation token found. Please check your email and use the confirmation link provided.");
            setMessage("Confirmation link invalid");
          }
        }
      } catch (err) {
        console.error("Email confirmation error:", err);
        setStatus("error");
        setError(err.message || "An error occurred while confirming your email. Please try again.");
        setMessage("Email confirmation failed");
      }
    };

    handleEmailConfirmation();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8 bg-neutral-900 text-neutral-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="text-center text-4xl font-bold tracking-tight mb-2">
          {status === "processing" && "CONFIRMING EMAIL"}
          {status === "success" && "EMAIL CONFIRMED"}
          {status === "error" && "CONFIRMATION ERROR"}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl bg-neutral-800 p-8 rounded-lg shadow-lg">
        {status === "processing" && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-lg text-neutral-300">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500 p-4">
                <svg
                  className="h-12 w-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-white">{message}</h3>
            <p className="text-neutral-400">
              You can now sign in and access all features of Cicada Music Society.
            </p>
            <div className="pt-4">
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-md bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition-colors"
              >
                Go to Sign In
              </Link>
            </div>
            <p className="text-sm text-neutral-500">
              Redirecting to home page...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-500 p-4">
                <svg
                  className="h-12 w-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-white">{message}</h3>
            <p className="text-neutral-400">{error}</p>
            <div className="pt-4 space-y-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-md bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition-colors"
              >
                Try Signing Up Again
              </Link>
              <div>
                <Link
                  href="/signin"
                  className="text-sm text-indigo-400 hover:text-indigo-300 underline"
                >
                  Already have an account? Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

