"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function VerifyTicketPage() {
  const { user, loading: authLoading } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [manualEntry, setManualEntry] = useState("");
  const [emailLookup, setEmailLookup] = useState("");
  const [emailResults, setEmailResults] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const [currentScanStatus, setCurrentScanStatus] = useState(null); // 'valid', 'used', or null
  const scannerRef = useRef(null);

  const startScanner = () => {
    setScanning(true);
    setVerificationResult(null);
    setCameraError(null);
    setCurrentScanStatus(null);
  };

  const resetScanStatus = () => {
    setCurrentScanStatus(null);
    setVerificationResult(null);
  };

  // Initialize scanner when scanning state becomes true and element is available
  useEffect(() => {
    if (!scanning) {
      // Clean up scanner when scanning stops
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current.clear();
            scannerRef.current = null;
          })
          .catch((err) => {
            console.error("Error stopping scanner:", err);
            scannerRef.current = null;
          });
      }
      return;
    }

    // Wait for DOM to update
    const timer = setTimeout(async () => {
      const element = document.getElementById("qr-reader");
      if (!element) {
        console.error("QR reader element not found");
        setCameraError("Failed to initialize scanner. Please try again.");
        setScanning(false);
        return;
      }

      try {
        // Check if we're on mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // Calculate appropriate qrbox size based on screen width
        const screenWidth = window.innerWidth;
        const qrboxSize = isMobile ? Math.min(250, screenWidth * 0.75) : 250;

        // Find back camera
        let selectedCameraId = null;
        try {
          const devices = await Html5Qrcode.getCameras();
          // Look for back camera (case-insensitive)
          const backCamera = devices.find(
            (device) =>
              device.label && device.label.toLowerCase().includes("back")
          );

          if (backCamera) {
            selectedCameraId = backCamera.id;
          } else if (devices.length > 0) {
            // Fallback: try to find environment-facing camera
            // On some devices, back camera might be labeled differently
            const envCamera = devices.find(
              (device) =>
                device.label &&
                (device.label.toLowerCase().includes("environment") ||
                  device.label.toLowerCase().includes("rear") ||
                  device.label.toLowerCase().includes("rear-facing"))
            );
            selectedCameraId = envCamera ? envCamera.id : devices[0].id;
          }
        } catch (err) {
          console.warn("Could not enumerate cameras:", err);
        }

        // Initialize scanner
        const html5QrCode = new Html5Qrcode("qr-reader");

        const config = {
          fps: 10,
          qrbox: { width: qrboxSize, height: qrboxSize },
          aspectRatio: 1.0,
          disableFlip: false,
        };

        // Start scanning with back camera
        const cameraIdOrConfig = selectedCameraId || {
          facingMode: "environment",
        };

        await html5QrCode.start(
          cameraIdOrConfig,
          config,
          (decodedText) => {
            // Keep scanner running - don't stop it
            setCameraError(null);

            // Handle both ticket number and JSON format
            let ticketNumber = decodedText;
            try {
              // Try to parse as JSON first (in case QR contains JSON)
              const parsed = JSON.parse(decodedText);
              if (parsed.ticketNumber) {
                ticketNumber = parsed.ticketNumber;
              }
            } catch (e) {
              // Not JSON, use as-is (should be ticket number)
            }

            verifyTicket(ticketNumber);
          },
          (errorMessage) => {
            // Handle camera permission errors
            if (errorMessage && typeof errorMessage === "string") {
              if (
                errorMessage.includes("Permission") ||
                errorMessage.includes("permission")
              ) {
                setCameraError(
                  "Camera permission denied. Please allow camera access in your browser settings."
                );
              } else if (
                errorMessage.includes("NotFound") ||
                errorMessage.includes("not found")
              ) {
                setCameraError(
                  "No camera found. Please ensure your device has a camera."
                );
              } else if (
                !errorMessage.includes("NotFoundException") &&
                !errorMessage.includes("No QR code found")
              ) {
                // Only log meaningful errors, ignore common scanning errors
                console.error("Scanner error:", errorMessage);
              }
            }
          }
        );

        scannerRef.current = html5QrCode;
      } catch (error) {
        console.error("Error starting scanner:", error);
        const errorMessage = error.message || "Failed to start camera";
        setCameraError(
          `${errorMessage}. Please ensure camera permissions are granted and try again.`
        );
        setScanning(false);
      }
    }, 150); // Small delay to ensure DOM is updated

    return () => {
      clearTimeout(timer);
      // Clean up scanner on unmount or when scanning changes
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current.clear();
            scannerRef.current = null;
          })
          .catch((err) => {
            console.error("Error cleaning up scanner:", err);
            scannerRef.current = null;
          });
      }
    };
  }, [scanning]);

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current.clear();
          scannerRef.current = null;
          setScanning(false);
          setCameraError(null);
        })
        .catch((err) => {
          console.error("Error stopping scanner:", err);
          scannerRef.current = null;
          setScanning(false);
          setCameraError(null);
        });
    } else {
      setScanning(false);
      setCameraError(null);
    }
  };

  const verifyTicket = async (ticketNumber) => {
    try {
      const response = await fetch("/api/verify-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketNumber }),
      });

      const result = await response.json();
      setVerificationResult(result);

      // Set scan status for overlay
      if (result.valid && !result.alreadyUsed) {
        setCurrentScanStatus("valid");
      } else if (result.alreadyUsed) {
        setCurrentScanStatus("used");
      } else {
        setCurrentScanStatus(null);
      }

      // Add to scan history
      setScanHistory((prev) => [
        {
          ticketNumber,
          result,
          customerName: result.ticket?.customer_name || "N/A",
          eventName: result.ticket?.event?.event_title || "N/A",
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 9), // Keep last 10 scans
      ]);
    } catch (error) {
      console.error("Error verifying ticket:", error);
      setVerificationResult({
        valid: false,
        error: "Failed to verify ticket",
      });
      setCurrentScanStatus(null);
    }
  };

  const markAsUsed = async () => {
    if (!verificationResult?.ticket?.id) return;

    try {
      const response = await fetch("/api/verify-ticket", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: verificationResult.ticket.id }),
      });

      if (response.ok) {
        setVerificationResult({
          ...verificationResult,
          ticket: { ...verificationResult.ticket, used: true },
          justMarkedUsed: true,
        });
        setCurrentScanStatus("used");
      }
    } catch (error) {
      console.error("Error marking ticket as used:", error);
      alert("Failed to mark ticket as used");
    }
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (manualEntry.trim()) {
      verifyTicket(manualEntry.trim());
      setManualEntry("");
    }
  };

  const handleEmailLookup = async (e) => {
    e.preventDefault();
    if (!emailLookup.trim()) return;

    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(
          `
          *,
          events (
            id,
            event_title,
            date,
            time,
            location,
            image
          )
        `
        )
        .eq("customer_email", emailLookup.trim())
        .order("purchase_date", { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
        setEmailResults({ error: "Failed to fetch tickets", tickets: [] });
        return;
      }

      setEmailResults({ tickets: data || [], email: emailLookup.trim() });
    } catch (error) {
      console.error("Error looking up email:", error);
      setEmailResults({ error: "Failed to fetch tickets", tickets: [] });
    }
  };

  const selectTicketFromEmail = async (ticket) => {
    try {
      // Mark ticket as used immediately
      const response = await fetch("/api/verify-ticket", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticket.id }),
      });

      if (response.ok) {
        // Update the email results to show this ticket as used
        setEmailResults({
          ...emailResults,
          tickets: emailResults.tickets.map((t) =>
            t.id === ticket.id
              ? { ...t, used: true, used_date: new Date().toISOString() }
              : t
          ),
        });

        // Add to scan history
        setScanHistory((prev) => [
          {
            ticketNumber: ticket.ticket_number,
            result: { valid: true, ticket },
            customerName: ticket.customer_name || "N/A",
            eventName: ticket.events?.event_title || "N/A",
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 9),
        ]);
      }
    } catch (error) {
      console.error("Error checking in ticket:", error);
      alert("Failed to check in ticket");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-gray-900 rounded-lg p-6 md:p-8 text-center border border-purple-700">
          <h1 className="text-xl md:text-2xl font-bold mb-4">
            Admin Access Required
          </h1>
          <p className="text-sm md:text-base text-gray-400 mb-6">
            Please log in with admin credentials to access the ticket
            verification system.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm md:text-base"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">
            Ticket Verification
          </h1>
          <p className="text-sm md:text-base text-gray-400">
            Scan QR codes to verify event tickets
          </p>
        </div>

        {/* Scanner Section */}
        <div className="bg-gray-900 rounded-lg p-4 md:p-6 mb-6 border border-gray-800">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            QR Code Scanner
          </h2>

          {!scanning ? (
            <div>
              <button
                onClick={startScanner}
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-base md:text-lg font-semibold"
              >
                Start Camera Scanner
              </button>
              {cameraError && (
                <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
                  <p className="text-red-300 text-sm">{cameraError}</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="relative mb-4">
                <div
                  id="qr-reader"
                  className="overflow-hidden rounded-lg"
                ></div>

                {/* Status Overlay - Top Right */}
                {currentScanStatus === "valid" && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-2 shadow-lg z-10 animate-pulse">
                    <svg
                      className="w-6 h-6 md:w-8 md:h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                {currentScanStatus === "used" && (
                  <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-2 shadow-lg z-10 animate-pulse">
                    <svg
                      className="w-6 h-6 md:w-8 md:h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                )}

                {/* Next Ticket Button - Bottom */}
                {currentScanStatus && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                    <button
                      onClick={resetScanStatus}
                      className="px-4 md:px-6 py-2 md:py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm md:text-base font-semibold shadow-lg"
                    >
                      Next Ticket
                    </button>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
                  <p className="text-red-300 text-sm">{cameraError}</p>
                </div>
              )}
              <button
                onClick={stopScanner}
                className="w-full px-4 md:px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-base md:text-lg"
              >
                Stop Scanner
              </button>
            </div>
          )}

          {/* Manual Entry */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h3 className="text-base md:text-lg font-semibold mb-3">
              Manual Entry
            </h3>
            <form
              onSubmit={handleManualVerify}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={manualEntry}
                onChange={(e) => setManualEntry(e.target.value)}
                placeholder="Enter ticket number (CICADA-XXX-YYY)"
                className="flex-1 px-4 py-2.5 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-sm md:text-base"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm md:text-base whitespace-nowrap"
              >
                Verify
              </button>
            </form>
          </div>

          {/* Email Lookup */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h3 className="text-base md:text-lg font-semibold mb-3">
              Email Lookup
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mb-3">
              Search for tickets by customer email address
            </p>
            <form
              onSubmit={handleEmailLookup}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                value={emailLookup}
                onChange={(e) => setEmailLookup(e.target.value)}
                placeholder="customer@example.com"
                className="flex-1 px-4 py-2.5 bg-black border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-sm md:text-base"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-sm md:text-base whitespace-nowrap"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Email Lookup Results */}
        {emailResults && (
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 mb-6 border border-indigo-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base md:text-xl font-semibold break-words pr-2">
                Tickets for {emailResults.email}
              </h2>
              <button
                onClick={() => setEmailResults(null)}
                className="text-gray-400 hover:text-white text-xl md:text-2xl flex-shrink-0"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {emailResults.error ? (
              <p className="text-red-400">{emailResults.error}</p>
            ) : emailResults.tickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-2">
                  No tickets found for this email
                </p>
                <p className="text-sm text-gray-500">
                  Please verify the email address is correct
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {emailResults.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`bg-black rounded-lg p-3 md:p-4 border ${
                      ticket.used
                        ? "border-yellow-800 bg-yellow-900 bg-opacity-10"
                        : "border-gray-800"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {ticket.events && (
                          <h3 className="font-semibold text-white mb-2 text-sm md:text-base break-words">
                            {ticket.events.event_title}
                          </h3>
                        )}
                        <div className="space-y-1 text-xs md:text-sm">
                          <p className="text-gray-400 break-all">
                            Ticket:{" "}
                            <span className="font-mono">
                              {ticket.ticket_number}
                            </span>
                          </p>
                          {ticket.events && (
                            <>
                              <p className="text-gray-400">
                                Date: {ticket.events.date} at{" "}
                                {ticket.events.time}
                              </p>
                              <p className="text-gray-400 break-words">
                                Location: {ticket.events.location}
                              </p>
                            </>
                          )}
                          <p className="text-gray-500 text-xs">
                            Purchased:{" "}
                            {new Date(ticket.purchase_date).toLocaleString()}
                          </p>
                        </div>
                        {ticket.used && (
                          <div className="mt-2 flex items-center gap-2 text-yellow-400 text-xs md:text-sm">
                            <span>
                              Already checked in on{" "}
                              {new Date(ticket.used_date).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {ticket.used ? (
                          <div className="px-3 md:px-4 py-2 bg-green-900 bg-opacity-40 text-green-300 rounded-lg border border-green-700 flex items-center gap-2 text-xs md:text-sm whitespace-nowrap">
                            <span>✓</span>
                            <span>Verified</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => selectTicketFromEmail(ticket)}
                            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm md:text-base"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <div
            className={`bg-gray-900 rounded-lg p-4 md:p-6 mb-6 border-2 ${
              verificationResult.valid && !verificationResult.alreadyUsed
                ? "border-green-500"
                : "border-red-500"
            }`}
          >
            {verificationResult.valid && !verificationResult.alreadyUsed ? (
              // Valid Ticket
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="text-2xl md:text-4xl">✅</div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-green-400">
                        Valid Ticket
                      </h3>
                      <p className="text-gray-400 text-xs md:text-sm">
                        Ready for check-in
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-black rounded-lg p-3 md:p-4 mb-4">
                  <p className="text-xs md:text-sm text-gray-400 mb-1">
                    Ticket Number:
                  </p>
                  <p className="font-mono text-sm md:text-lg break-all">
                    {verificationResult.ticket.ticket_number}
                  </p>
                </div>

                {verificationResult.ticket.event && (
                  <div className="bg-purple-900 bg-opacity-30 rounded-lg p-3 md:p-4 mb-4">
                    <h4 className="font-semibold text-base md:text-lg mb-2 break-words">
                      {verificationResult.ticket.event.event_title}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-300">
                      Date: {verificationResult.ticket.event.date}
                    </p>
                    <p className="text-xs md:text-sm text-gray-300">
                      Time: {verificationResult.ticket.event.time}
                    </p>
                    <p className="text-xs md:text-sm text-gray-300 break-words">
                      Location: {verificationResult.ticket.event.location}
                    </p>
                  </div>
                )}

                <div className="bg-black rounded-lg p-3 md:p-4 mb-4">
                  <p className="text-xs md:text-sm text-gray-400 break-words">
                    Customer: {verificationResult.ticket.customer_name || "N/A"}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 break-all">
                    Email: {verificationResult.ticket.customer_email}
                  </p>
                </div>

                {!verificationResult.justMarkedUsed ? (
                  <button
                    onClick={markAsUsed}
                    className="w-full px-4 md:px-6 py-3 md:py-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-base md:text-lg font-semibold"
                  >
                    ✓ Check In (Mark as Used)
                  </button>
                ) : (
                  <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-3 md:p-4 text-center">
                    <p className="text-green-400 font-semibold text-sm md:text-base">
                      ✓ Checked In Successfully!
                    </p>
                  </div>
                )}
              </div>
            ) : verificationResult.alreadyUsed ? (
              // Already Used
              <div>
                <div className="flex items-center gap-2 md:gap-3 mb-4">
                  <div className="text-2xl md:text-4xl">⚠️</div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-yellow-400">
                      Already Used
                    </h3>
                    <p className="text-gray-400 text-xs md:text-sm">
                      This ticket has been checked in
                    </p>
                  </div>
                </div>

                <div className="bg-black rounded-lg p-3 md:p-4 mb-4">
                  <p className="text-xs md:text-sm text-gray-400 mb-1">
                    Ticket Number:
                  </p>
                  <p className="font-mono text-sm md:text-lg break-all">
                    {verificationResult.ticket.ticket_number}
                  </p>
                </div>

                <div className="bg-yellow-900 bg-opacity-30 rounded-lg p-3 md:p-4">
                  <p className="text-xs md:text-sm text-gray-300">
                    Used on:{" "}
                    {new Date(verificationResult.usedDate).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              // Invalid
              <div>
                <div className="flex items-center gap-2 md:gap-3 mb-4">
                  <div className="text-2xl md:text-4xl">❌</div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-red-400">
                      Invalid Ticket
                    </h3>
                    <p className="text-gray-400 text-xs md:text-sm break-words">
                      {verificationResult.error || "Ticket not found"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setVerificationResult(null);
                setCurrentScanStatus(null);
                startScanner();
              }}
              className="w-full mt-4 px-4 md:px-6 py-2.5 md:py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm md:text-base"
            >
              Scan Another Ticket
            </button>
          </div>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-800">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Recent Scans
            </h2>
            <div className="space-y-2">
              {scanHistory.map((scan, index) => (
                <div
                  key={index}
                  className="bg-black rounded p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-semibold text-white mb-1 break-words">
                      {scan.eventName}
                    </p>
                    <p className="font-mono text-xs md:text-sm break-all">
                      {scan.ticketNumber}
                    </p>
                    <p className="text-xs md:text-sm text-gray-300 mt-1 break-words">
                      {scan.customerName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(scan.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded text-xs md:text-sm whitespace-nowrap ${
                      scan.result.valid && !scan.result.alreadyUsed
                        ? "bg-green-900 text-green-300"
                        : scan.result.alreadyUsed
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-red-900 text-red-300"
                    }`}
                  >
                    {scan.result.valid && !scan.result.alreadyUsed
                      ? "Valid"
                      : scan.result.alreadyUsed
                      ? "Used"
                      : "Invalid"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
