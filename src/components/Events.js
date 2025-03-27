"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import EditEvent from "./EditEvent";
import Checkout from "./Checkout";

const Events = () => {
  const [events, setEvents] = useState([]); // State to store events
  const [loading, setLoading] = useState(true); // Loading status
  const [editingEventId, setEditingEventId] = useState(null); // Track which event is in edit mode

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });
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

  // Callback to refresh events and exit edit mode
  const handleEventUpdated = () => {
    fetchEvents();
    setEditingEventId(null);
  };

  return (
    <section id="events" className="px-6 py-10 bg-black text-white">
      <h2 className="text-4xl font-bold text-center">Upcoming Events</h2>
      <div className="mt-6 max-w-3xl mx-auto space-y-6">
        {loading && <p>Loading events...</p>}
        {events.map((event) => (
          <div
            key={event.id}
            className="p-4 border border-gray-700 rounded-lg flex flex-col md:flex-row md:justify-between items-start gap-4"
          >
            {editingEventId === event.id ? (
              <EditEvent
                event={event}
                onEventUpdated={handleEventUpdated}
                onClose={() => setEditingEventId(null)}
              />
            ) : (
              <>
                <div className="flex flex-col gap-y-2 w-full">
                  <h3 className="text-xl font-semibold">{event.event_title}</h3>
                  <p className="text-gray-400">{event.location}</p>
                  <p className="text-gray-400">{event.desc}</p>
                  <p className="text-neutral-400">
                    {new Date(`1970-01-01T${event.time}`).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}
                    <span className="text-gray-300 bg-gray-800 px-4 py-2 rounded-full mx-2">
                      {event.date}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <button
                    onClick={() => setEditingEventId(event.id)}
                    className="bg-indigo-500 px-4 py-2 rounded-md text-white hover:bg-indigo-400"
                  >
                    Edit
                  </button>
                  <div className="w-full md:w-auto">
                    <script
                      async
                      src="https://js.stripe.com/v3/buy-button.js"
                    ></script>
                    <stripe-buy-button
                      buy-button-id="buy_btn_1R075TLp1OI919OFTDDc18rF"
                      publishable-key="pk_test_51QyQjuLp1OI919OFeP9pJMcTpfn74c5uRYBnl2kG0PJsOeXipSRf2RCBPM142YaubzSoi9TDZG0mYFfvwTEVXhWU00D5pFd1TC"
                    ></stripe-buy-button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Events;
