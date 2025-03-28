"use client";
import React, { useRef, useState, useEffect } from "react";

const MusicPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    // Resume the AudioContext on user interaction if needed
    if (audioContext && audioContext.state === "suspended") {
      await audioContext.resume();
    }
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      {/* Make sure to pass the id to the actual audio element */}
      <audio
        id="global-audio"
        ref={audioRef}
        src={src}
        preload="metadata"
        controls
      />
      <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>
    </div>
  );
};

export default MusicPlayer;
