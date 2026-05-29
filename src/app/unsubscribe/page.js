"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      setStatus("error");
      return;
    }

    fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`)
      .then((res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">CICADA</h1>
        <p className="text-purple-400 text-sm">Music Society</p>

        {status === "loading" && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-400">Processing your request...</p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 space-y-4">
            <p className="text-xl font-semibold">You've been unsubscribed</p>
            <p className="text-gray-400">
              You will no longer receive promotional emails from Cicada. You'll
              still receive ticket confirmation emails for any future purchases.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-gray-900 rounded-lg p-8 border border-red-800 space-y-4">
            <p className="text-xl font-semibold">Something went wrong</p>
            <p className="text-gray-400">
              We couldn't process your unsubscribe request. The link may be
              invalid or expired. Please contact us on{" "}
              <a
                href="https://www.instagram.com/cicada.dtx/"
                className="text-purple-400 underline"
              >
                Instagram
              </a>{" "}
              for help.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
