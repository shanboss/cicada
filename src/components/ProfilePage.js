"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  // Sync form data when profile/user changes or edit mode is entered
  useEffect(() => {
    if (editing) {
      setFormData({
        first_name:
          profile?.first_name || user?.user_metadata?.first_name || "",
        last_name:
          profile?.last_name || user?.user_metadata?.last_name || "",
        phone_number:
          profile?.phone_number || user?.user_metadata?.phone_number || "",
      });
    }
  }, [editing, profile, user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    await refreshProfile();
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-300 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-neutral-400">
              View and manage your account information
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium cursor-pointer"
            >
              Edit Profile
            </button>
          )}
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

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                First Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              ) : (
                <p className="text-white text-lg">
                  {profile?.first_name ||
                    user?.user_metadata?.first_name ||
                    "Not set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Last Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              ) : (
                <p className="text-white text-lg">
                  {profile?.last_name ||
                    user?.user_metadata?.last_name ||
                    "Not set"}
                </p>
              )}
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
              {editing ? (
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              ) : (
                <p className="text-white text-lg">
                  {profile?.phone_number ||
                    user?.user_metadata?.phone_number ||
                    "Not provided"}
                </p>
              )}
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

          {/* Edit Actions */}
          {editing && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium cursor-pointer"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-2.5 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

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
      </div>
    </div>
  );
}
