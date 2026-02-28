"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";

const BUCKET_NAME = "images";
const FOLDER_PATHS = ["images/Gallery", "Gallery"];
const MARQUEE_SPEED = 50; // pixels per second

// Try to infer DJ and event names from the filename.
// Example convention: "dj-aurora_summer-bass-night.jpg"
const parseImageMetadata = (name) => {
  const base = name.replace(/\.[^/.]+$/, "");
  const parts = base.split("_");

  if (parts.length >= 2) {
    const djRaw = parts[0];
    const eventRaw = parts.slice(1).join(" ");

    const formatPart = (value) =>
      value
        .replace(/[-]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");

    return {
      djName: formatPart(djRaw),
      eventName: formatPart(eventRaw),
    };
  }

  return {
    djName: "Cicada DJ",
    eventName: "Cicada Event",
  };
};

const Gallery = ({ images = [] }) => {
  const [slides, setSlides] = useState([]);
  const [isDragging, setIsDragging] = useState(null); // 'forward' | 'reverse' | null

  const forwardRowRef = useRef(null);
  const reverseRowRef = useRef(null);
  const forwardPosRef = useRef(0);
  const reversePosRef = useRef(0);
  const halfWidthRef = useRef(0);
  const rafIdRef = useRef(null);
  const lastTimeRef = useRef(null);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);

  // Normalise either passed-in images or Supabase images into a common structure
  useEffect(() => {
    const useProvidedImages = async () => {
      if (images && images.length > 0) {
        const normalised = images.map((src, index) => ({
          src,
          djName: `Cicada DJ ${index + 1}`,
          eventName: "Cicada Event",
        }));
        setSlides(normalised);
        return true;
      }
      return false;
    };

    const fetchFromSupabase = async () => {
      // Try a couple of likely folder paths so this works whether
      // the files live under "images/Gallery" or just "Gallery".
      for (const folder of FOLDER_PATHS) {
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .list(folder, {
            limit: 50,
            sortBy: { column: "name", order: "asc" },
          });

        if (error) {
          console.error(
            `Error loading gallery images from Supabase folder "${folder}":`,
            error,
          );
          continue;
        }

        const files = data || [];

        const mapped = files
          // Skip hidden entries and folders (which usually lack an extension)
          .filter(
            (file) =>
              !file.name.startsWith(".") &&
              /\.[a-z0-9]+$/i.test(file.name) &&
              /\.(jpe?g|png|webp|gif|heic)$/i.test(file.name),
          )
          .map((file) => {
            const path = `${folder}/${file.name}`;
            const {
              data: { publicUrl },
            } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

            const meta = parseImageMetadata(file.name);

            return {
              src: publicUrl,
              ...meta,
            };
          });

        if (mapped.length > 0) {
          setSlides(mapped);
          return;
        }
      }

      // If we got here, we didn't find any usable files
      setSlides([]);
    };

    const init = async () => {
      const usedProvided = await useProvidedImages();
      if (!usedProvided) {
        await fetchFromSupabase();
      }
    };

    init();
  }, [images]);

  // JS-driven marquee: update positions and apply transforms; pause while dragging
  useEffect(() => {
    if (!slides.length) return;

    const forwardRow = forwardRowRef.current;
    const reverseRow = reverseRowRef.current;
    if (!forwardRow || !reverseRow) return;

    if (halfWidthRef.current <= 0) {
      halfWidthRef.current = forwardRow.scrollWidth / 2;
    }

    const tick = (now) => {
      const halfWidth = halfWidthRef.current;
      if (halfWidth <= 0) {
        rafIdRef.current = requestAnimationFrame(tick);
        return;
      }
      lastTimeRef.current ??= now;
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isDragging !== "forward") {
        forwardPosRef.current += MARQUEE_SPEED * dt;
        if (forwardPosRef.current >= halfWidth)
          forwardPosRef.current -= halfWidth;
        forwardRow.style.transform = `translateX(${-forwardPosRef.current}px)`;
      }
      if (isDragging !== "reverse") {
        reversePosRef.current += MARQUEE_SPEED * dt;
        if (reversePosRef.current >= halfWidth)
          reversePosRef.current -= halfWidth;
        reverseRow.style.transform = `translateX(${reversePosRef.current - halfWidth}px)`;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [slides.length, isDragging]);

  const getPointerX = (e) =>
    e.clientX != null ? e.clientX : (e.touches?.[0]?.clientX ?? 0);

  const handlePointerDown = useCallback((row, e) => {
    const isForward = row === "forward";
    if (halfWidthRef.current <= 0) return;
    const clientX = getPointerX(e);
    dragStartXRef.current = clientX;
    dragStartPosRef.current = isForward
      ? forwardPosRef.current
      : reversePosRef.current;
    setIsDragging(isForward ? "forward" : "reverse");
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (row, e) => {
      if (isDragging !== row) return;
      e.preventDefault();
      const clientX = getPointerX(e);
      const delta = clientX - dragStartXRef.current;
      const halfWidth = halfWidthRef.current;
      if (halfWidth <= 0) return;

      if (row === "forward") {
        let pos = dragStartPosRef.current - delta;
        pos = ((pos % halfWidth) + halfWidth) % halfWidth;
        forwardPosRef.current = pos;
        if (forwardRowRef.current) {
          forwardRowRef.current.style.transform = `translateX(${-pos}px)`;
        }
      } else {
        let pos = dragStartPosRef.current + delta;
        pos = ((pos % halfWidth) + halfWidth) % halfWidth;
        reversePosRef.current = pos;
        if (reverseRowRef.current) {
          reverseRowRef.current.style.transform = `translateX(${pos - halfWidth}px)`;
        }
      }
    },
    [isDragging],
  );

  const handlePointerUp = useCallback((_row, e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setIsDragging(null);
  }, []);

  // Re-measure when slides change
  useEffect(() => {
    if (!slides.length) return;
    halfWidthRef.current = 0;
    const forwardRow = forwardRowRef.current;
    if (forwardRow) {
      const measure = () => {
        if (forwardRowRef.current)
          halfWidthRef.current = forwardRowRef.current.scrollWidth / 2;
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(forwardRow);
      return () => ro.disconnect();
    }
  }, [slides]);

  if (!slides.length) {
    return null;
  }

  return (
    <section className="relative w-full py-6 px-2 ">
      <div className="relative w-full py-6 overflow-hidden">
        <div className="space-y-4">
          {[false, true].map((isReverse) => {
            const rowKey = isReverse ? "reverse" : "forward";
            const isRowDragging = isDragging === rowKey;

            return (
              <div
                key={isReverse ? "reverse" : "forward"}
                ref={isReverse ? reverseRowRef : forwardRowRef}
                className={`flex gap-4 w-max select-none ${
                  isRowDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{ touchAction: "none" }}
                onPointerDown={(e) => handlePointerDown(rowKey, e)}
                onPointerMove={(e) => handlePointerMove(rowKey, e)}
                onPointerUp={(e) => handlePointerUp(rowKey, e)}
                onPointerLeave={(e) => {
                  if (e.buttons === 0) setIsDragging(null);
                }}
              >
                {[...slides, ...slides].map((slide, idx) => (
                  <div
                    key={`${slide.src}-${isReverse ? "r" : "f"}-${idx}`}
                    className="relative flex-shrink-0 border hover:border-[0.2rem] border-cyan-200 hover:border-pink-300 w-[18rem] h-48 sm:h-56 md:h-60 rounded-2xl overflow-hidden bg-black/60 group cursor-pointer"
                  >
                    <img
                      src={slide.src}
                      alt={`${slide.djName} at ${slide.eventName}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Top overlay for DJ name */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/85 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-start px-3 py-2">
                      <span className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-100 drop-shadow-md">
                        {slide.djName}
                      </span>
                    </div>

                    {/* Bottom overlay for event name */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between px-3 py-2">
                      <span className="text-[0.7rem] sm:text-xs font-medium text-neutral-200 drop-shadow-md">
                        {slide.eventName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
