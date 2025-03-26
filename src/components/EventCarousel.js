"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

const EventCarousel = () => {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch upcoming events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true }); // Sort by date (soonest first)

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data);
      }
    };

    fetchEvents();
  }, []);

  // Auto-slide every 6 seconds
  useEffect(() => {
    if (events.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [events]);

  // if (events.length === 0) {
  //   return <p className="text-white text-center">No upcoming events.</p>;
  // }

  return (
    <div className="relative w-full bg-black/50 overflow-hidden flex flex-col items-start justify-start p-6 text-wrap">
      {/* Title */}
      <div className="relative w-full overflow-hidden flex flex-col items-start p-6">
        {/* Title - Aligned Left */}
        <h2 className="text-2xl font-bold text-neutral-300 text-left">
          Upcoming Events
        </h2>

        {/* Carousel Container */}
        <div
          className="w-full h-full flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {events.map((event) => (
            <div
              key={event.id}
              className="flex flex-row justify-between items-center p-8"
            >
              {/* Text container takes available space */}
              <div className="flex-1 flex flex-col justify-start items-start">
                <h3 className="text-3xl sm:text-5xl font-bold text-white">
                  {event.event_title}
                </h3>
                <p className="text-white mt-2 text-2xl">{event.desc}</p>
                <p className="text-neutral-300 mt-2 text-xl">
                  {new Date(event.date).toLocaleDateString()} |{" "}
                  {new Date(`1970-01-01T${event.time}`).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
                <Link
                  href={"/events"}
                  className="bg-indigo-700 px-4 py-2 rounded-lg m-2 hover:bg-indigo-600 duration-100"
                >
                  Get Tickets Now!
                </Link>
              </div>
              {/* Image container: set width as needed */}
              <div className="flex-shrink-0 ml-4">
                <img
                  src={event.image}
                  alt={event.event_title}
                  className="w-48 h-auto rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventCarousel;
