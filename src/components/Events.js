"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Checkout from "./Checkout";

// const events = [
//   { date: "Feb 10", title: "Underground DJ Night", location: "Club 303" },
//   { date: "Mar 5", title: "Production Workshop", location: "Studio B" },
// ];

const Events = () => {
  const [events, setEvents] = useState([]); // State to store events
  const [loading, setLoading] = useState(true); // State for loading status
  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true }); // Sort by date

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data);
    }
    setLoading(false);
  };

  // Fetch events on page load
  useEffect(() => {
    fetchEvents();
  }, []);
  return (
    <section id="events" className="px-6 py-10 bg-black text-white">
      <h2 className="text-4xl font-bold text-center">Upcoming Events</h2>
      <div className="mt-6 max-w-3xl mx-auto space-y-6">
        {events.map((event, index) => (
          <div
            key={index}
            className="p-4 border border-gray-700 rounded-lg flex justify-between items-center"
          >
            <div className="flex flex-col gap-y-2">
              <h3 className="text-xl font-semibold">{event.event_title}</h3>
              <p className="text-gray-400">{event.location}</p>
              <p className="text-gray-400">{event.desc}</p>
              <p className="text-neutral-400">
                {new Date(`1970-01-01T${event.time}`).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
                <span className="text-gray-300 bg-gray-800 px-4 py-2 rounded-full mx-2">
                  {event.date}
                </span>
              </p>
            </div>

            <script async src="https://js.stripe.com/v3/buy-button.js"></script>

            <stripe-buy-button
              buy-button-id="buy_btn_1R075TLp1OI919OFTDDc18rF"
              publishable-key="pk_test_51QyQjuLp1OI919OFeP9pJMcTpfn74c5uRYBnl2kG0PJsOeXipSRf2RCBPM142YaubzSoi9TDZG0mYFfvwTEVXhWU00D5pFd1TC"
            ></stripe-buy-button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Events;
