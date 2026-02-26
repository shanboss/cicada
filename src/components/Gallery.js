"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const BUCKET_NAME = "images";
const FOLDER_PATHS = ["images/Gallery", "Gallery"];

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
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
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
  const [isPausedForward, setIsPausedForward] = useState(false);
  const [isPausedReverse, setIsPausedReverse] = useState(false);

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
            error
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
              /\.(jpe?g|png|webp|gif|heic)$/i.test(file.name)
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

  if (!slides.length) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden py-6">
      <div className="relative w-full bg-black/40 border border-white/10 sm:rounded-3xl px-4 py-6 shadow-2xl overflow-hidden">
        <div className="space-y-4">
          {[false, true].map((isReverse) => {
            const isPaused = isReverse ? isPausedReverse : isPausedForward;

            return (
              <div
                key={isReverse ? "reverse" : "forward"}
                className={`flex gap-4 w-max gallery-marquee ${
                  isReverse ? "gallery-marquee-reverse" : ""
                } ${isPaused ? "gallery-marquee--paused" : ""}`}
                onMouseEnter={() =>
                  isReverse
                    ? setIsPausedReverse(true)
                    : setIsPausedForward(true)
                }
                onMouseLeave={() =>
                  isReverse
                    ? setIsPausedReverse(false)
                    : setIsPausedForward(false)
                }
              >
              {[...slides, ...slides].map((slide, idx) => (
                <div
                  key={`${slide.src}-${isReverse ? "r" : "f"}-${idx}`}
                  className="relative flex-shrink-0 w-[18rem] h-48 sm:h-56 md:h-60 rounded-2xl overflow-hidden bg-black/60 group cursor-pointer"
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
