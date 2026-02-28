"use client";

export default function VideoOverlay({ src }) {
  return (
    <div className="inset-0 z-0 overflow-hidden fixed">
      <video
        className="h-full w-full object-cover"
        src={src}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-black/50" />
    </div>
  );
}
