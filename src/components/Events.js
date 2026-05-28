"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import EditEvent from "./EditEvent";
import Checkout from "./Checkout";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PaintBackground from "./PaintBackground";

const Events = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]); // State to store events
  const [loading, setLoading] = useState(true); // Loading status
  const [editingEventId, setEditingEventId] = useState(null); // Track which event is in edit mode

  const handleNav = (link) => {
    router.push(link);
  };
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
        // Set empty array on error to prevent rendering issues
        setEvents([]);
      } else {
        setEvents(data || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
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

  // Separate events into upcoming and past
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to beginning of day

  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.date + "T00:00:00");
    return eventDate >= today;
  });

  const pastEvents = events.filter((event) => {
    const eventDate = new Date(event.date + "T00:00:00");
    return eventDate < today;
  });

  return (
    <section id="events" className="relative text-white overflow-hidden pt-10 py-2">

      {/* Content with relative positioning */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Loading Skeletons */}
        {loading && (
          <>
            <div className="max-w-5xl mx-auto">
              <div className="h-10 w-64 bg-white/10 rounded animate-pulse mb-6" />
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-4 border border-white/10 rounded-lg flex flex-col md:flex-row gap-4 mb-6 animate-pulse"
                >
                  <div className="w-full md:w-1/3">
                    <div className="w-full aspect-square bg-white/10 rounded" />
                  </div>
                  <div className="w-full md:w-2/3 flex flex-col justify-center space-y-4">
                    <div className="h-6 w-3/4 bg-white/10 rounded" />
                    <div className="h-4 w-1/2 bg-white/10 rounded" />
                    <div className="h-4 w-2/3 bg-white/10 rounded" />
                    <div className="h-10 w-full bg-white/10 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 max-w-5xl mx-auto">
              <div className="h-10 w-48 bg-white/10 rounded animate-pulse mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-white/10 rounded-lg overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-white/10" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 w-3/4 bg-white/10 rounded" />
                      <div className="h-3 w-1/2 bg-white/10 rounded" />
                      <div className="h-3 w-2/3 bg-white/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Upcoming Events Section */}
        {!loading && upcomingEvents.length > 0 && (
          <>
            <h2 className="text-4xl font-bold text-left max-w-5xl mx-auto">
              Upcoming Events
            </h2>
            <div className="mt-6 max-w-5xl mx-auto space-y-6 bg-white/10">
              {upcomingEvents.map((event) => (
                <PaintBackground key={event.id} imageSrc={event.image}>
                <div
                  className="p-4 border border-white/20 rounded-lg flex flex-col md:flex-row gap-4 backdrop-blur-md shadow-lg"
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
                      <div className="w-full md:w-1/3 relative">
                        <Image
                          src={event.image}
                          alt={event.event_title}
                          width={400}
                          height={400}
                          priority={true}
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjIyIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzMzMztzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNDQ0O3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMzMzO3N0b3Atb3BhY2l0eToxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg=="
                          className="w-full h-auto rounded"
                        />
                      </div>
                      {/* Right Column: Details */}
                      <div className="w-full md:w-2/3 flex flex-col justify-center">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">
                            {event.event_title}
                          </h3>
                          <p className="text-gray-300">{event.location}</p>
                          <p className="text-neutral-400">
                            {new Date(
                              `1970-01-01T${event.time}`,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                            <span className="text-gray-300 bg-indigo-800 px-4 py-2 rounded-full mx-2">
                              {event.date}
                            </span>
                          </p>
                        </div>
                        <div className="mt-4 w-full">
                          {event.stripe_price_id && (
                            <Link
                              href={`/checkout/${event.id}`}
                              className="block rounded-xl px-4 py-2 bg-indigo-800 w-full hover:bg-indigo-700 duration-200 text-center"
                            >
                              Buy Tickets
                            </Link>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                </PaintBackground>
              ))}
            </div>
          </>
        )}

        {/* Past Events Section */}
        {!loading && pastEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-4xl font-bold text-left max-w-5xl mx-auto">
              Past Events
            </h2>
            <div className="mt-6 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="border border-white/20 rounded-lg overflow-hidden hover:border-white/40 transition-colors duration-200 bg-white/5 backdrop-blur-md shadow-lg"
                >
                  <Image
                    src={event.image}
                    alt={event.event_title}
                    width={400}
                    height={192}
                    priority={true}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE5MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjIyIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzMzMztzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNDQ0O3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMzMzO3N0b3Atb3BhY2l0eToxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg=="
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="text-sm font-semibold truncate">
                      {event.event_title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{event.date}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Events;
