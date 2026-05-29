"use client";

import React, { useState } from "react";
import {
  CalendarDaysIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  MegaphoneIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/solid";

const tabs = [
  { key: "events", label: "Events", icon: CalendarDaysIcon },
  { key: "send-tickets", label: "Send Tickets", icon: PaperAirplaneIcon },
  { key: "purchase-analysis", label: "Purchase Analysis", icon: ChartBarIcon },
  { key: "email-blast", label: "Email Blast", icon: MegaphoneIcon },
];

export default function AdminSidebar({ activeTab, onTabChange }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:block shrink-0 bg-neutral-800 border-r border-neutral-700 min-h-screen pt-2 px-3 transition-all duration-200 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Collapse toggle */}
        <div
          className={`flex mb-3 ${collapsed ? "justify-center" : "justify-end"}`}
        >
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeftIcon
              className={`h-5 w-5 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {tabs.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => onTabChange(key)}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-neutral-800 border-t border-neutral-700">
        {tabs.map(({ key, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex-1 flex items-center justify-center py-3 transition-colors ${
                active
                  ? "text-indigo-400 bg-neutral-700"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Icon className="h-6 w-6" />
            </button>
          );
        })}
      </nav>
    </>
  );
}
