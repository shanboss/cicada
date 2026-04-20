import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const [ticketsRes, eventsRes] = await Promise.all([
      supabaseAdmin
        .from("tickets")
        .select("*, events(event_title, date)")
        .not("stripe_payment_intent", "is", null),
      supabaseAdmin
        .from("events")
        .select("id, event_title")
        .order("date", { ascending: false }),
    ]);

    if (ticketsRes.error) {
      return NextResponse.json(
        { error: "Failed to fetch tickets", details: ticketsRes.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tickets: ticketsRes.data || [],
      events: eventsRes.data || [],
    });
  } catch (error) {
    console.error("Error in purchase-analysis API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
