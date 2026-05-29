"use client";

import React, { useState, useEffect, useMemo } from "react";

const TEMPLATE = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

      * { margin: 0; padding: 0; box-sizing: border-box; }

      body {
        background-color: #0a0a0a;
        color: #e8e6e1;
        font-family: 'DM Sans', sans-serif;
        font-weight: 300;
        -webkit-font-smoothing: antialiased;
      }

      .wrapper {
        max-width: 560px;
        margin: 0 auto;
        padding: 48px 24px;
      }

      .header {
        border-bottom: 1px solid #2a2a2a;
        padding-bottom: 32px;
        margin-bottom: 48px;
      }

      .wordmark {
        font-family: 'DM Mono', monospace;
        font-weight: 300;
        font-size: 11px;
        letter-spacing: 0.35em;
        text-transform: uppercase;
        color: #888;
      }

      .divider-line {
        width: 24px;
        height: 1px;
        background: #333;
        margin: 24px 0;
      }

      .event-label {
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        font-weight: 400;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: #555;
        margin-bottom: 12px;
      }

      .event-title {
        font-size: 36px;
        font-weight: 300;
        letter-spacing: -0.02em;
        line-height: 1.1;
        color: #f0ede8;
        margin-bottom: 4px;
      }

      .event-subtitle {
        font-size: 36px;
        font-weight: 300;
        letter-spacing: -0.02em;
        line-height: 1.1;
        color: #3a3a3a;
      }

      .meta-block {
        margin-top: 40px;
        display: table;
        width: 100%;
      }

      .meta-row {
        display: table-row;
      }

      .meta-label {
        display: table-cell;
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        color: #444;
        padding: 8px 24px 8px 0;
        vertical-align: top;
        white-space: nowrap;
      }

      .meta-value {
        display: table-cell;
        font-size: 14px;
        font-weight: 400;
        color: #c8c5bf;
        padding: 8px 0;
        line-height: 1.5;
      }

      .body-text {
        margin-top: 40px;
        font-size: 15px;
        line-height: 1.75;
        color: #666;
        font-weight: 300;
      }

      .cta-block {
        margin-top: 48px;
        padding-top: 32px;
        border-top: 1px solid #1e1e1e;
      }

      .cta-button {
        display: inline-block;
        text-decoration: none;
        font-family: 'DM Mono', monospace;
        font-size: 11px;
        font-weight: 400;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #0a0a0a;
        background: #e8e6e1;
        padding: 14px 32px;
        border-radius: 2px;
      }

      .cta-note {
        margin-top: 16px;
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        color: #333;
        letter-spacing: 0.15em;
      }

      .footer {
        margin-top: 64px;
        padding-top: 32px;
        border-top: 1px solid #181818;
      }

      .footer-wordmark {
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.35em;
        text-transform: uppercase;
        color: #2a2a2a;
        margin-bottom: 12px;
      }

      .footer-text {
        font-size: 11px;
        color: #333;
        line-height: 1.7;
      }

      .footer-text a {
        color: #444;
        text-decoration: underline;
      }

      @media (max-width: 480px) {
        .event-title,
        .event-subtitle {
          font-size: 28px;
        }
      }
    </style>
  </head>
  <body style="background-color:#0a0a0a">
    <!--$-->
    <div
      style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0"
      data-skip-in-text="true"
    >
      {{ event_name }}
    </div>
    <!--body-->
    <table
      border="0"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      align="center"
      style="background-color:#0a0a0a"
    >
      <tbody>
        <tr>
          <td style="background-color:#0a0a0a">
            <table
              align="left"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="max-width:600px;width:100%;color:#e8e6e1;background-color:#0a0a0a;border-radius:0px;border-color:#0a0a0a"
            >
              <tbody>
                <tr style="width:100%">
                  <td style="padding:0">
                    <div class="wrapper">
                      <div class="header">
                        <div class="wordmark">Cicada Collective</div>
                      </div>

                      <div class="event-label">Upcoming Event</div>
                      <div class="event-title">{{ event_name }}</div>
                      <div class="event-subtitle">{{ event_tagline }}</div>
                      <div class="divider-line"></div>

                      <div class="meta-block">
                        <div class="meta-row">
                          <div class="meta-label">Date</div>
                          <div class="meta-value">{{ event_date }}</div>
                        </div>
                        <div class="meta-row">
                          <div class="meta-label">Time</div>
                          <div class="meta-value">{{ event_time }}</div>
                        </div>
                        <div class="meta-row">
                          <div class="meta-label">Venue</div>
                          <div class="meta-value">{{ venue_name }}<br />{{ venue_address }}</div>
                        </div>
                        <div class="meta-row">
                          <div class="meta-label">Entry</div>
                          <div class="meta-value">{{ ticket_price }}</div>
                        </div>
                      </div>

                      <p class="body-text">{{ body_text }}</p>

                      <div class="cta-block">
                        <a
                          href="{{ ticket_url }}"
                          class="cta-button"
                          rel="noopener noreferrer nofollow"
                          target="_blank"
                          style="display:inline-block;text-decoration:none;font-family:'DM Mono',monospace;font-size:11px;font-weight:400;letter-spacing:0.2em;text-transform:uppercase;color:#0a0a0a;background:#e8e6e1;padding:14px 32px;border-radius:2px"
                          >Get Tickets</a
                        >
                        <div class="cta-note">Limited capacity — {{ ticket_note }}</div>
                      </div>

                      <div class="footer">
                        <div class="footer-wordmark">Cicada</div>
                        <div class="footer-text">
                          You're receiving this because you signed up for Cicada updates.<br />
                          <a
                            href="{{ unsubscribe_url }}"
                            rel="noopener noreferrer nofollow"
                            target="_blank"
                            style="color:#444;text-decoration:underline"
                            ><u>Unsubscribe</u></a
                          >
                          · {{ city }}, {{ country }}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--/$-->
  </body>
</html>`;

// Template variables — "auto" means populated from the event, "manual" means typed by admin
const TEMPLATE_VARS = [
  { key: "event_name", label: "Event Name", auto: true },
  { key: "event_tagline", label: "Event Tagline", auto: false },
  { key: "event_date", label: "Date", auto: true },
  { key: "event_time", label: "Time", auto: true },
  { key: "venue_name", label: "Venue Name", auto: true },
  { key: "venue_address", label: "Venue Address", auto: false },
  { key: "ticket_price", label: "Entry / Price", auto: true },
  { key: "body_text", label: "Body Text", auto: true },
  { key: "ticket_url", label: "Ticket URL", auto: true },
  { key: "ticket_note", label: "Ticket Note", auto: false },
  { key: "city", label: "City", auto: false },
  { key: "country", label: "Country", auto: false },
];

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr) {
  try {
    return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeStr;
  }
}

function getTicketPrice(event) {
  if (event.ticket_tiers && Array.isArray(event.ticket_tiers) && event.ticket_tiers.length > 0) {
    return event.ticket_tiers
      .map((t) => `${t.label} — $${Number(t.price).toFixed(2)}`)
      .join(" / ");
  }
  if (event.ticket_price != null) {
    return `$${Number(event.ticket_price).toFixed(2)}`;
  }
  return "";
}

function buildVarsFromEvent(event) {
  return {
    event_name: event.event_title || "",
    event_tagline: "",
    event_date: event.date ? formatDate(event.date) : "",
    event_time: event.time ? formatTime(event.time) : "",
    venue_name: event.location || "",
    venue_address: "",
    ticket_price: getTicketPrice(event),
    body_text: event.desc || "",
    ticket_url: `https://mucicada.com/checkout/${event.id}`,
    ticket_note: "",
    city: "",
    country: "",
  };
}

const EMPTY_VARS = Object.fromEntries(TEMPLATE_VARS.map((v) => [v.key, ""]));

export default function BroadcastEmail({ events = [] }) {
  const [subject, setSubject] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [vars, setVars] = useState(EMPTY_VARS);
  const [templateHtml, setTemplateHtml] = useState(TEMPLATE);
  const [varsOpen, setVarsOpen] = useState(false);
  const [audience, setAudience] = useState("subscribers");
  const [customEmail, setCustomEmail] = useState("");
  const [subscriberCount, setSubscriberCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const updateVar = (key, value) =>
    setVars((prev) => ({ ...prev, [key]: value }));

  // Auto-select latest event on mount
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      const first = events[0];
      setSelectedEventId(first.id);
      setVars(buildVarsFromEvent(first));
      setSubject(`You're Invited — ${first.event_title}`);
    }
  }, [events]);

  // Autofill when event selection changes
  const handleEventChange = (eventId) => {
    setSelectedEventId(eventId);
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setVars(buildVarsFromEvent(event));
      setSubject(`You're Invited — ${event.event_title}`);
    }
  };

  // Fetch subscriber count on mount
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/admin/send-broadcast");
        const data = await res.json();
        if (res.ok) {
          setSubscriberCount(data.count);
        }
      } catch (err) {
        console.error("Failed to fetch subscriber count:", err);
      }
    }
    fetchCount();
  }, []);

  // Live preview with variables replaced
  const previewHtml = useMemo(() => {
    let html = templateHtml;
    for (const v of TEMPLATE_VARS) {
      html = html.replaceAll(`{{ ${v.key} }}`, vars[v.key] || "");
    }
    html = html.replaceAll("{{ unsubscribe_url }}", "#");
    return html;
  }, [vars, templateHtml]);

  const handleSend = () => {
    setError("");
    setResults(null);
    setConfirming(true);
  };

  const handleConfirmSend = async () => {
    setConfirming(false);
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/admin/send-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          vars,
          templateHtml,
          audience,
          ...(audience === "custom" ? { customEmail } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send broadcast");
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasRequiredFields =
    subject.trim() &&
    vars.event_name.trim() &&
    (audience === "subscribers" || customEmail.trim());

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Email Blast</h2>
          <p className="text-neutral-400 mt-1">
            Compose and send promotional emails to all subscribers
            {subscriberCount !== null && (
              <span className="ml-2 text-indigo-400 font-semibold">
                ({subscriberCount} active subscriber{subscriberCount !== 1 ? "s" : ""})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Audience selector */}
      <div className="mb-6 flex items-center gap-3">
        <select
          id="broadcast-audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="p-2 bg-neutral-700 rounded text-white text-sm"
        >
          <option value="subscribers">All Subscribers{subscriberCount !== null ? ` (${subscriberCount})` : ""}</option>
          <option value="custom">Custom Email</option>
        </select>
        {audience === "custom" && (
          <input
            type="email"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            className="flex-1 p-2 bg-neutral-700 rounded text-white text-sm"
            placeholder="recipient@example.com"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Form */}
        <div>
          <div className="bg-neutral-800 p-6 rounded-lg shadow-md space-y-4">
            {/* Event Selection */}
            <div>
              <label
                htmlFor="broadcast-event"
                className="block text-sm font-medium text-neutral-400 mb-2"
              >
                Event *
              </label>
              <select
                id="broadcast-event"
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                className="w-full p-2 bg-neutral-700 rounded text-white"
              >
                {events.length === 0 && (
                  <option value="">No events available</option>
                )}
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.event_title} — {ev.date}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="broadcast-subject"
                className="block text-sm font-medium text-neutral-400 mb-2"
              >
                Subject *
              </label>
              <input
                type="text"
                id="broadcast-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 bg-neutral-700 rounded text-white"
                placeholder="e.g. You're Invited — Cicada Presents..."
              />
            </div>

            {/* Collapsible: Edit Variables */}
            <div className="border border-neutral-700 rounded">
              <button
                type="button"
                onClick={() => setVarsOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-neutral-300 hover:bg-neutral-700/50 transition-colors"
              >
                <span>Edit Variables</span>
                <svg
                  className={`h-4 w-4 text-neutral-400 transition-transform ${varsOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {varsOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-neutral-700">
                  {TEMPLATE_VARS.map((v) => (
                    <div key={v.key}>
                      <label
                        htmlFor={`var-${v.key}`}
                        className="block text-sm font-medium text-neutral-400 mb-1 mt-3"
                      >
                        {v.label}
                      </label>
                      {v.key === "body_text" ? (
                        <textarea
                          id={`var-${v.key}`}
                          value={vars[v.key]}
                          onChange={(e) => updateVar(v.key, e.target.value)}
                          className="w-full p-2 bg-neutral-700 rounded text-white text-sm"
                          rows={3}
                        />
                      ) : (
                        <input
                          type="text"
                          id={`var-${v.key}`}
                          value={vars[v.key]}
                          onChange={(e) => updateVar(v.key, e.target.value)}
                          className="w-full p-2 bg-neutral-700 rounded text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* HTML Template Editor */}
            <div>
              <label
                htmlFor="broadcast-template"
                className="block text-sm font-medium text-neutral-400 mb-2"
              >
                Template HTML
              </label>
              <textarea
                id="broadcast-template"
                value={templateHtml}
                onChange={(e) => setTemplateHtml(e.target.value)}
                className="w-full p-2 bg-neutral-700 rounded text-white font-mono text-xs"
                rows={16}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Use {"{{ variable_name }}"} syntax. Variables are replaced with values from the fields above.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500 rounded text-red-400">
                {error}
              </div>
            )}

            {/* Confirmation box */}
            {confirming && (
              <div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded">
                <p className="text-yellow-400 font-medium mb-3">
                  Are you sure? This will send an email to{" "}
                  {audience === "custom" ? (
                    <strong>{customEmail}</strong>
                  ) : (
                    <>
                      <strong>{subscriberCount}</strong> subscriber
                      {subscriberCount !== 1 ? "s" : ""}
                    </>
                  )}
                  .
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmSend}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-semibold"
                  >
                    Confirm Send
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            {results && (
              <div className="p-4 bg-green-900/20 border border-green-500 rounded">
                <p className="text-green-400 font-medium">Broadcast complete!</p>
                <p className="text-neutral-300 mt-1">
                  Sent: {results.sent} | Failed: {results.failed} | Total: {results.total}
                </p>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={loading || !hasRequiredFields || confirming}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white py-2 rounded font-semibold"
            >
              {loading ? "Sending..." : "Send Broadcast"}
            </button>
          </div>
        </div>

        {/* Right column: Preview */}
        <div>
          <div className="bg-neutral-800 p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-neutral-400 mb-3">
              Live Preview
            </h3>
            <div className="rounded overflow-hidden border border-neutral-700">
              <iframe
                srcDoc={previewHtml}
                title="Email preview"
                className="w-full"
                style={{ height: "600px", border: "none" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
