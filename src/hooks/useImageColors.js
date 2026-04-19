import { useEffect, useState } from "react";

const FALLBACK_COLORS = [
  "rgb(99, 102, 241)",
  "rgb(79, 70, 229)",
  "rgb(67, 56, 202)",
  "rgb(55, 48, 163)",
];

const SIZE = 50;

export default function useImageColors(src) {
  const [colors, setColors] = useState(FALLBACK_COLORS);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        // Bucket pixels into quantized color bins
        const buckets = {};
        for (let i = 0; i < data.length; i += 4) {
          const r = Math.round(data[i] / 32) * 32;
          const g = Math.round(data[i + 1] / 32) * 32;
          const b = Math.round(data[i + 2] / 32) * 32;
          const key = `${r},${g},${b}`;
          buckets[key] = (buckets[key] || 0) + 1;
        }

        // Sort by frequency, pick top 4
        const sorted = Object.entries(buckets)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([key]) => {
            const [r, g, b] = key.split(",");
            return `rgb(${r}, ${g}, ${b})`;
          });

        if (sorted.length >= 4) {
          setColors(sorted);
        }
      } catch {
        // CORS or canvas tainted — keep fallback
      }
    };

    img.onerror = () => {
      // Keep fallback colors
    };

    img.src = src;
  }, [src]);

  return colors;
}
