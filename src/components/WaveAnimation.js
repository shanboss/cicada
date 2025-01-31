"use client";
import { motion } from "framer-motion";

export default function WaveAnimation() {
  const numLines = 200; // Number of lines
  const duration = Math.random() * 9.5; // Wave cycle duration

  return (
    <div className="absolute inset-0 flex justify-center items-center opacity-50 bg-black">
      <div className="flex justify-center w-full h-full items-center space-x-1">
        {[...Array(numLines)].map((_, i) => {
          const randomHeight = Math.random() * 80 + 50; // Random height between 50px - 150px
          const randomDelay = Math.random() * 0.01; // Random delay for chaos
          return (
            <motion.div
              key={i}
              className="w-[0.1rem] bg-indigo-500 rounded-full"
              initial={{ height: "20px" }}
              animate={{
                height: [
                  `${Math.random() * 20 + 20}px`, // Random low
                  `${randomHeight}px`, // Random peak
                  `${Math.random() * 20 + 20}px`, // Random low
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
