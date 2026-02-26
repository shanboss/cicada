"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";

const AuthContext = createContext({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("[AuthProvider] Error fetching profile:", error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("[AuthProvider] Unexpected error fetching profile:", err);
      setProfile(null);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.log("[AuthProvider] No active session");
          setUser(null);
          setProfile(null);
        } else if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("[AuthProvider] Unexpected error:", err);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "TOKEN_REFRESHED") {
        return;
      }

      if (event === "TOKEN_REFRESH_FAILED") {
        console.error("[AuthProvider] Token refresh failed, signing out");
        supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        return;
      }

      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setProfile(null);
        return;
      }

      if (event === "SIGNED_IN") {
        setUser(session.user);
        fetchProfile(session.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const isAdmin =
    profile?.user_role === "admin" || user?.user_metadata?.role === "admin";

  const value = {
    user,
    profile,
    isAdmin,
    loading,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
