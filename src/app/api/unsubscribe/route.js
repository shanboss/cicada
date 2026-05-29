import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  if (!email || !token) {
    return NextResponse.json(
      { error: "Missing email or token parameter" },
      { status: 400 }
    );
  }

  // Validate HMAC token
  const secret =
    process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const expectedToken = crypto
    .createHmac("sha256", secret)
    .update(email)
    .digest("hex");

  if (token !== expectedToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  // Set subscribed = false
  const { error } = await supabaseAdmin
    .from("email_subscribers")
    .update({ subscribed: false, updated_at: new Date().toISOString() })
    .eq("email", email);

  if (error) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
