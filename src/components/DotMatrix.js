"use client";
import { motion } from "framer-motion";

const DotMatrixHorizontal = ({
  rows = 3,
  columns = 10,
  dotSize = 8, // in pixels
  gap = 8, // in pixels (gap between dots)
  animationDuration = 10, // seconds for one full loop
}) => {
  // Calculate the total width of one grid (in pixels)
  const gridWidth = columns * dotSize + (columns - 1) * gap;

  // Build a grid of dots
  const grid = (
    <div className="flex flex-col" style={{ width: `${gridWidth}px` }}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          style={{ display: "flex", gap: `${gap}px` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`dot-${rowIndex}-${colIndex}`}
              style={{
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                backgroundColor: "white",
                borderRadius: "50%",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    // Outer container hides overflow so the animation appears seamless
    <div style={{ overflow: "hidden", width: `${gridWidth}px` }}>
      <motion.div
        style={{ display: "flex", width: `${gridWidth * 2}px` }}
        // Animate from left (-gridWidth) to right (0) for a left-to-right motion
        animate={{ x: [-gridWidth, 0] }}
        transition={{
          duration: animationDuration,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {/* Duplicate grid for seamless looping */}
        <div>{grid}</div>
        <div>{grid}</div>
      </motion.div>
    </div>
  );
};

export default DotMatrixHorizontal;
