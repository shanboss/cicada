"use server";

import { headers } from "next/headers";
import { stripe } from "../../../lib/stripe";

/**
 * Create a Stripe checkout session for an event
 * @param {Object} params
 * @param {string} params.priceId - Stripe Price ID
 * @param {string} params.eventId - Event ID from database
 * @param {string} params.eventTitle - Event title for display
 */
export async function createCheckoutSession({ priceId, eventId, eventTitle }) {
  const origin = (await headers()).get("origin");

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
      // Store event information in metadata
      metadata: {
        event_id: eventId,
        event_title: eventTitle,
      },
      // Enable customer email collection
      customer_email: undefined, // Let customer provide email
    });

    return session.client_secret;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Create a standard (non-embedded) checkout session
 * @param {Object} params
 * @param {string} params.priceId - Stripe Price ID
 * @param {string} params.eventId - Event ID from database
 * @param {string} params.eventTitle - Event title for display
 * @param {number} params.quantity - Number of tickets to purchase (default: 1)
 */
export async function createStandardCheckout({ priceId, eventId, eventTitle, quantity = 1 }) {
  const origin = (await headers()).get("origin");

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events`,
      metadata: {
        event_id: eventId,
        event_title: eventTitle,
        quantity: quantity.toString(),
      },
    });

    return session.url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

