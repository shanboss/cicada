"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function WaveAnimation({ duration = 3 }) {
  const [numLines, setNumLines] = useState(200); // Default for large screens

  // Function to set number of lines based on screen size
  const updateNumLines = () => {
    const width = window.innerWidth;
    if (width < 640) setNumLines(70); // Mobile (sm)
    else if (width < 1024) setNumLines(100); // Tablet (md)
    else if (width < 1440) setNumLines(200); // Small Desktop (lg)
    else setNumLines(300); // Large Desktop (xl)
  };

  // Run once on mount and add resize event listener
  useEffect(() => {
    updateNumLines(); // Set initial value
    window.addEventListener("resize", updateNumLines);
    return () => window.removeEventListener("resize", updateNumLines); // Cleanup
  }, []);

  return (
    <div className="absolute inset-0 flex justify-center items-center opacity-50 bg-black">
      <div className="flex justify-center w-full h-full items-center space-x-1">
        {[...Array(numLines)].map((_, i) => {
          const randomHeight = Math.random() * 80 + 100; // Random height between 50px - 150px
          const randomDelay = Math.random() * 0.01; // Random delay for chaos
          return (
            <motion.div
              key={i}
              className="w-[0.1rem] rounded-full"
              initial={{ height: "20px" }}
              animate={{
                height: [
                  `${Math.random() * 20 + 20}px`, // Random low
                  `${randomHeight}px`, // Random peak
                  `${Math.random() * 20 + 20}px`, // Random low
                ],
                backgroundColor: [
                  "#8B5CF6", // Purple
                  "#14B8A6", // Teal
                  "#06B6D4", // Cyan
                  "#ff8dA1", // Pink
                  "#8B5CF6", // Purple (Loop back)
                ],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                repeatType: "loop",
                delay: i * 0.01 + randomDelay, // Adds randomness to the stagger effect
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
