"use client";

import React from "react";
import {
  CalendarDaysIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";

const tabs = [
  { key: "events", label: "Events", icon: CalendarDaysIcon },
  { key: "send-tickets", label: "Send Tickets", icon: PaperAirplaneIcon },
  { key: "purchase-analysis", label: "Purchase Analysis", icon: ChartBarIcon },
];

export default function AdminSidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-56 shrink-0 bg-neutral-800 border-r border-neutral-700 min-h-screen pt-20 px-3">
      <nav className="flex flex-col gap-1">
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
