"use client";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "../../lib/supabaseClient";
import { useState, useEffect } from "react";
import localFont from "next/font/local";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const getSession = async () => {
      try {
        // Use getSession instead of getUser - it doesn't throw errors
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        
        if (error) {
          // Handle AuthSessionMissingError gracefully
          if (error.message?.includes("session") || error.message?.includes("Auth session missing")) {
            console.log("[Layout] No active session");
            setUser(null);
          } else {
            console.error("[Layout] Error getting session:", error);
            setUser(null);
          }
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error("[Layout] Unexpected error getting session:", err);
        setUser(null);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      // Handle token refresh errors
      if (_event === 'TOKEN_REFRESHED') {
        console.log("[Layout] Token refreshed successfully");
      } else if (_event === 'SIGNED_OUT') {
        console.log("[Layout] User signed out");
        setUser(null);
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);
  return (
    <html lang="en">
      <body className={"font-monument antialiased pt-20"}>
        <Navbar />
        <div className="my-10">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
