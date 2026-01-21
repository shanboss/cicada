"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use getSession first (more reliable, doesn't throw errors)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          // Redirect to home if not signed in
          router.push("/");
          return;
        }

        setUser(session.user);

        // Fetch profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setError("Failed to load profile data.");
        } else {
          setProfile(profileData);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  // Don't render if user is not signed in (redirecting)
  if (!user && !loading) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-300 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-neutral-400">
            View and manage your account information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-neutral-800 rounded-lg shadow-lg p-8">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-neutral-700">
            <div className="w-24 h-24 rounded-full bg-indigo-600 text-white text-4xl font-semibold flex items-center justify-center">
              {profile?.first_name
                ? profile.first_name.charAt(0).toUpperCase()
                : user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : user?.user_metadata?.first_name &&
                    user?.user_metadata?.last_name
                  ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                  : "User"}
              </h2>
              <p className="text-neutral-400">{user?.email}</p>
              {profile?.role && (
                <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-600/30">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                First Name
              </label>
              <p className="text-white text-lg">
                {profile?.first_name ||
                  user?.user_metadata?.first_name ||
                  "Not set"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Last Name
              </label>
              <p className="text-white text-lg">
                {profile?.last_name ||
                  user?.user_metadata?.last_name ||
                  "Not set"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Email Address
              </label>
              <p className="text-white text-lg">{user?.email || "Not set"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Phone Number
              </label>
              <p className="text-white text-lg">
                {profile?.phone_number ||
                  user?.user_metadata?.phone_number ||
                  "Not provided"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Account Created
              </label>
              <p className="text-white text-lg">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-8 border-t border-neutral-700 flex flex-col sm:flex-row gap-4">
            <Link
              href="/my-tickets"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-center"
            >
              View My Tickets
            </Link>
            {profile?.user_role === "admin" && (
              <Link
                href="/admin"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-center"
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              href="/"
              className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && profile && (
          <div className="mt-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
