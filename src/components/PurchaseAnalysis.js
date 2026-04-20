"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function getWeekLabel(date) {
  const d = new Date(date);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `W${week} ${d.getFullYear()}`;
}

function getMonthLabel(date) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

function getDayLabel(date) {
  return new Date(date).toLocaleDateString();
}

function groupKey(dateStr, grouping) {
  if (!dateStr) return "Unknown";
  if (grouping === "daily") return getDayLabel(dateStr);
  if (grouping === "weekly") return getWeekLabel(dateStr);
  return getMonthLabel(dateStr);
}

function sortKey(label, grouping) {
  if (label === "Unknown") return Infinity;
  if (grouping === "daily") return new Date(label).getTime();
  if (grouping === "weekly") {
    const [w, year] = label.split(" ");
    return Number(year) * 100 + Number(w.slice(1));
  }
  return new Date(label + " 1").getTime();
}

export default function PurchaseAnalysis() {
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [grouping, setGrouping] = useState("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/purchase-analysis");
      const data = await res.json();

      if (res.ok) {
        setTickets(data.tickets || []);
        setEvents(data.events || []);
      } else {
        console.error("Failed to fetch purchase data:", data.error);
      }
    } catch (err) {
      console.error("Error fetching purchase data:", err);
    }

    setLoading(false);
  };

  const filteredTickets =
    selectedEvent === "all"
      ? tickets
      : tickets.filter((t) => String(t.event_id) === selectedEvent);

  // Group tickets by the selected grouping
  const chartData = filteredTickets.reduce((acc, ticket) => {
    const key = groupKey(ticket.purchase_date, grouping);
    const existing = acc.find((d) => d.date === key);
    if (existing) {
      existing.tickets += 1;
    } else {
      acc.push({ date: key, tickets: 1 });
    }
    return acc;
  }, []);

  chartData.sort((a, b) => sortKey(a.date, grouping) - sortKey(b.date, grouping));

  const groupingOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Purchase Analysis</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-6">
        <div>
          <label
            htmlFor="event-filter"
            className="block text-sm font-medium text-neutral-400 mb-2"
          >
            Filter by Event
          </label>
          <select
            id="event-filter"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="bg-neutral-700 text-white p-2 rounded w-full max-w-xs"
          >
            <option value="all">All Events</option>
            {events.map((event) => (
              <option key={event.id} value={String(event.id)}>
                {event.event_title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="block text-sm font-medium text-neutral-400 mb-2">
            Group by
          </span>
          <div className="flex rounded-lg overflow-hidden border border-neutral-600">
            {groupingOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGrouping(opt.value)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  grouping === opt.value
                    ? "bg-indigo-600 text-white"
                    : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary stat */}
      <div className="bg-neutral-800 p-4 rounded-lg mb-6 inline-block">
        <p className="text-sm text-neutral-400">Total Tickets Sold</p>
        <p className="text-3xl font-bold text-indigo-400">
          {filteredTickets.length}
        </p>
      </div>

      {/* Line chart */}
      {loading ? (
        <p>Loading purchase data...</p>
      ) : chartData.length === 0 ? (
        <p className="text-neutral-400">No purchase data available.</p>
      ) : (
        <div className="bg-neutral-800 p-4 rounded-lg">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#525252" />
              <XAxis
                dataKey="date"
                stroke="#a3a3a3"
                tick={{ fontSize: 12 }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#a3a3a3"
                allowDecimals={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#262626",
                  border: "1px solid #525252",
                  borderRadius: "8px",
                  color: "#e5e5e5",
                }}
              />
              <Line
                type="monotone"
                dataKey="tickets"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
