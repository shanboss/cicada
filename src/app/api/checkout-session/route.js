import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";

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

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (error) {
    console.error("Error retrieving session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}

