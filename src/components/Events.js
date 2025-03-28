"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import EditEvent from "./EditEvent";
import Checkout from "./Checkout";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Events = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]); // State to store events
  const [loading, setLoading] = useState(true); // Loading status
  const [editingEventId, setEditingEventId] = useState(null); // Track which event is in edit mode

  const handleNav = (link) => {
    router.push(link);
  };
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
      <div className="mt-6 max-w-5xl mx-auto space-y-6">
        {loading && <p>Loading events...</p>}
        {events.map((event) => (
          <div
            key={event.id}
            className="p-4 border border-gray-700 rounded-lg flex flex-col md:flex-row gap-4"
          >
            {editingEventId === event.id ? (
              <EditEvent
                event={event}
                onEventUpdated={handleEventUpdated}
                onClose={() => setEditingEventId(null)}
              />
            ) : (
              <>
                {/* Left Column: Image */}
                <div className="w-full md:w-1/2">
                  <img
                    src={event.image}
                    alt={event.event_title}
                    className="w-full h-auto rounded"
                  />
                </div>
                {/* Right Column: Details */}
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">
                      {event.event_title}
                    </h3>
                    <p className="text-gray-300">{event.location}</p>
                    <p className="text-neutral-400">
                      {new Date(`1970-01-01T${event.time}`).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                      <span className="text-gray-300 bg-indigo-800 px-4 py-2 rounded-full mx-2">
                        {event.date}
                      </span>
                    </p>
                    <p className="text-gray-400 text-xs whitespace-pre-wrap">
                      {event.desc}
                    </p>{" "}
                  </div>
                  <div className="mt-4 w-full">
                    <button
                      onClick={() => handleNav(event.payment_link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl px-4 py-2 bg-indigo-800 w-full hover:bg-indigo-700 duration-200"
                    >
                      Buy Tickets
                    </button>
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
