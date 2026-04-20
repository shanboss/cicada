"use client";

import React from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

export default function EventsTable({ events, loading, onEdit }) {
  if (loading) {
    return <p className="text-neutral-400">Loading events...</p>;
  }

  if (events.length === 0) {
    return <p className="text-neutral-400">No events found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-700">
      <table className="w-full text-left">
        <thead className="bg-neutral-800 text-neutral-400 text-sm uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3">Event Name</th>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3 text-right">Edit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-700">
          {events.map((event) => {
            const eventDate = new Date(event.date + "T00:00:00");
            const isExpired = eventDate < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <tr
                key={event.id}
                className={`bg-neutral-900 hover:bg-neutral-800 transition-colors ${
                  isExpired ? "opacity-50" : ""
                }`}
              >
                <td className="px-5 py-4 font-medium text-white">
                  {event.event_title}
                </td>
                <td className="px-5 py-4 text-neutral-400">
                  {eventDate.toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => onEdit(event)}
                    className="p-2 bg-blue-600 rounded-full hover:bg-blue-500 transition"
                  >
                    <PencilSquareIcon className="h-4 w-4 text-white" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
