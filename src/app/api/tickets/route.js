import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Fetch tickets with event information
    const { data: tickets, error } = await supabaseAdmin
      .from("tickets")
      .select(`
        *,
        events (
          event_title,
          date,
          time,
          location
        )
      `)
      .eq("stripe_session_id", sessionId)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching tickets:", error);
      return NextResponse.json(
        { error: "Failed to fetch tickets", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tickets: tickets || [],
      count: tickets?.length || 0,
    });
  } catch (error) {
    console.error("Error in tickets API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

