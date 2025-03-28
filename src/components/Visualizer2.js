"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

const Visualizer2 = ({ src, title }) => {
  // Basic Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fixed number of waveform lines (non-responsive)
  const numLines = 200; // You can adjust this number as needed

  // Refs for audio element and Web Audio API nodes (used only for playback/progress)
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);

  // Setup the audio context for progress updates (not driving the waveform)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    analyzerRef.current = audioContextRef.current.createAnalyser();
    analyzerRef.current.fftSize = 512;
    dataArrayRef.current = new Uint8Array(
      analyzerRef.current.frequencyBinCount
    );

    sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
    sourceRef.current.connect(analyzerRef.current);
    analyzerRef.current.connect(audioContextRef.current.destination);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Toggle playback
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
      audio.play();
      setIsPlaying(true);
    }
  };

  // Update progress based on the audio's current time
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Player Controls */}
      <div className="absolute top-4 left-4 z-50 flex items-center space-x-2 bg-neutral-800 text-white p-4 rounded shadow">
        <button onClick={togglePlay} className="focus:outline-none">
          {isPlaying ? (
            <PauseIcon className="h-6 w-6" />
          ) : (
            <PlayIcon className="h-6 w-6" />
          )}
        </button>
        <p>{title}</p>
      </div>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        src={src}
        preload="auto"
      />

      {/* Waveform Animation */}
      <div className="absolute inset-0 flex justify-center items-center opacity-50">
        <div className="flex justify-center items-center space-x-1 w-full h-full">
          {[...Array(numLines)].map((_, i) => {
            // Random heights for a dynamic waveform effect.
            const randomLow1 = Math.random() * 40 + 40; // between 40 and 80px
            const randomPeak = Math.random() * 100 + 200; // between 200 and 300px
            const randomLow2 = Math.random() * 40 + 40;
            const randomDelay = Math.random() * 0.01;
            return (
              <motion.div
                key={i}
                className="w-[0.1rem] rounded-full"
                initial={{ height: "40px" }}
                animate={{
                  height: [
                    `${randomLow1}px`,
                    `${randomPeak}px`,
                    `${randomLow2}px`,
                  ],
                  backgroundColor: [
                    "#8B5CF6", // Purple
                    "#14B8A6", // Teal
                    "#06B6D4", // Cyan
                    "#ff8da1", // Pink
                    "#8B5CF6", // Loop back to Purple
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: i * 0.01 + randomDelay,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-4 left-0 right-0 mx-auto w-11/12">
        <div className="w-full h-2 bg-gray-300 rounded">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-indigo-800 rounded"
          />
        </div>
      </div>
    </div>
  );
};

export default Visualizer2;
