"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

const Footer = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    // Check if user is logged in
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/"; // Redirect after logout (optional)
  };
  return (
    <footer className="py-6 bg-gray-900 text-white text-center">
      <p className="text-gray-400">
        © 2026 Cicada Music Society | All Rights Reserved
      </p>
      <div className="mt-4 flex justify-center items-center space-x-4">
        <Link href="/admin" className="hover:text-blue-500">
          Admin
        </Link>
        {user && (
          <button
            className="hover:text-red-400 duration-100"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        )}
      </div>
    </footer>
  );
};

export default Footer;
