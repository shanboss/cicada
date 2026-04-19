"use client";
import useImageColors from "../hooks/useImageColors";

const BLOB_CONFIGS = [
  { size: "70%", top: "-20%", left: "-10%", animation: "paint-blob-1 12s ease-in-out infinite" },
  { size: "60%", top: "-10%", right: "-15%", animation: "paint-blob-2 15s ease-in-out infinite" },
  { size: "55%", bottom: "-20%", left: "20%", animation: "paint-blob-3 18s ease-in-out infinite" },
  { size: "50%", bottom: "-10%", right: "-5%", animation: "paint-blob-4 20s ease-in-out infinite" },
];

export default function PaintBackground({ imageSrc, children }) {
  const colors = useImageColors(imageSrc);

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Blob container */}
      <div className="absolute inset-0 opacity-30">
        {BLOB_CONFIGS.map((cfg, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: cfg.size,
              height: cfg.size,
              top: cfg.top,
              left: cfg.left,
              right: cfg.right,
              bottom: cfg.bottom,
              background: `radial-gradient(circle, ${colors[i]} 0%, transparent 70%)`,
              animation: cfg.animation,
            }}
          />
        ))}
      </div>

      {/* Grain overlay */}
      <div className="paint-grain absolute inset-0 pointer-events-none z-[1]" />

      {/* Content */}
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}
