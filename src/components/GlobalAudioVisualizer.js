import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSoundcloud } from "@fortawesome/free-brands-svg-icons";

/** Returns a different number of bars based on window width. */
function getResponsiveBarCount(width) {
  if (width >= 1024) return 70; // large screens (lg)
  if (width >= 768) return 50; // medium screens (md)
  if (width >= 640) return 30; // small screens (sm)
  return 15; // extra small
}

const GlobalAudioVisualizer = ({ src, title }) => {
  // State for play/pause, progress, and drag seeking
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [barCount, setBarCount] = useState(70);

  // Visualizer constants
  const baseline = 2; // minimum “base” height (in pixels) always visible
  const sensitivityFactor = 1; // amplifies the frequency data reaction
  const maxHeight = 400; // maximum height (in pixels) for each bar

  // New parameters to control which part of the frequency spectrum to display.
  // Here, we process bins from the very start (0) to 60% of the total bins.
  const startBinRatio = 0.0;
  const endBinRatio = 1;
  const lowFrequencyBoost = 1.2;

  // Initial bar heights set to the baseline
  const [barHeights, setBarHeights] = useState(Array(barCount).fill(baseline));
  const [peakHeights, setPeakHeights] = useState(
    Array(barCount).fill(baseline)
  );

  // References for audio element and Web Audio API nodes
  const audioRef = useRef(null);
  const animationIdRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);

  // Helper for responsive behavior.
  function getBreakpoint(width) {
    if (width >= 1024) return "lg";
    if (width >= 768) return "md";
    if (width >= 640) return "sm";
    return "xs";
  }

  useEffect(() => {
    let currentBreakpoint = getBreakpoint(window.innerWidth);
    function updateBarCount() {
      const newCount = getResponsiveBarCount(window.innerWidth);
      setBarCount(newCount);
    }
    updateBarCount(); // Run once on mount.
    function handleResize() {
      const newBreakpoint = getBreakpoint(window.innerWidth);
      if (newBreakpoint !== currentBreakpoint) {
        // The user has crossed a breakpoint boundary.
        window.location.reload();
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Setup Web Audio API on mount.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    analyzerRef.current = audioContextRef.current.createAnalyser();
    // Using a larger fftSize for more frequency bins.
    analyzerRef.current.fftSize = 512;
    const bufferLength = analyzerRef.current.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    // Connect the audio element to the analyzer and then to the speakers.
    sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
    sourceRef.current.connect(analyzerRef.current);
    analyzerRef.current.connect(audioContextRef.current.destination);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Function to compute an interpolated color for a given bar index.
  // The gradient stops are: purple, blue.
  const getBarColor = (index) => {
    const gradientStops = [
      [128, 0, 128], // purple
      [49, 127, 245], // blue
    ];
    const totalStops = gradientStops.length;
    const segments = totalStops - 1;
    const segmentSize = barCount / segments;
    const segmentIndex = Math.min(
      Math.floor(index / segmentSize),
      segments - 1
    );
    const fraction = (index - segmentIndex * segmentSize) / segmentSize;

    const startColor = gradientStops[segmentIndex];
    const endColor = gradientStops[segmentIndex + 1];

    const r = Math.round(
      startColor[0] + fraction * (endColor[0] - startColor[0])
    );
    const g = Math.round(
      startColor[1] + fraction * (endColor[1] - startColor[1])
    );
    const b = Math.round(
      startColor[2] + fraction * (endColor[2] - startColor[2])
    );

    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Animation loop for updating frequency data.
  const animate = () => {
    if (analyzerRef.current) {
      analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
      const totalBins = dataArrayRef.current.length;
      // Define the start and end bin based on our ratios.
      const startBin = Math.floor(totalBins * startBinRatio);
      const endBin = Math.floor(totalBins * endBinRatio);
      const processedBinCount = endBin - startBin;
      // Avoid division by zero by ensuring a minimum step of 1.
      const step = Math.max(1, Math.floor(processedBinCount / barCount));

      const newBarHeights = [];
      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArrayRef.current[startBin + i * step + j];
        }
        const rawValue = sum / step;
        const transformedValue = Math.pow(rawValue, 1);
        newBarHeights.push(transformedValue);
      }
      setBarHeights(newBarHeights);
      setPeakHeights((prevPeaks) =>
        prevPeaks.map((peak, i) => {
          // Calculate boost multiplier so that lower frequencies (leftmost bars) get extra amplification.
          const boostMultiplier =
            1 + ((barCount - i) / barCount) * (lowFrequencyBoost - 1);
          const effectiveSensitivity = sensitivityFactor * boostMultiplier;
          // Compute the raw height.
          let computedHeight = Math.max(
            newBarHeights[i] * effectiveSensitivity,
            baseline
          );
          // --- NEW: More dynamic low-frequency reaction ---
          // Treat the first 30% of bars as bass.
          if (i < Math.floor(barCount * 0.5)) {
            const bassThreshold = 255; // Adjust this threshold as needed.
            if (computedHeight < bassThreshold) {
              // When bass is quiet, barely move.
              computedHeight = baseline + (computedHeight - baseline) * 0.9;
            } else {
              // When bass is loud, amplify the reaction.
              computedHeight = baseline + (computedHeight - baseline) * 3;
            }
          }
          computedHeight = Math.min(computedHeight, maxHeight);
          // Update the peak height with a slow decay.
        })
      );
    }
    animationIdRef.current = requestAnimationFrame(animate);
  };

  // Toggle playback and start/stop the animation loop.
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animationIdRef.current);
      // Reset bars to baseline when paused.
      setBarHeights(Array(barCount).fill(baseline));
    } else {
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
      audio.play();
      setIsPlaying(true);
      animationIdRef.current = requestAnimationFrame(animate);
    }
  };

  // Update progress based on the audio's current time.
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  // Functions to support click and drag seeking on the progress bar.
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percent = Math.min(Math.max(offsetX / rect.width, 0), 1);
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = percent * audio.duration;
      setProgress(percent * 100);
    }
  };

  const handleMouseDown = (e) => {
    setIsSeeking(true);
    handleSeek(e);
  };

  const handleMouseMove = (e) => {
    if (isSeeking) {
      handleSeek(e);
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsSeeking(false);
  };

  return (
    <div className="relative max-w-full">
      {/* Flex container to hold both the player and the text */}
      <div className="absolute top-[2rem] lg:top-[3rem] left-[2rem] flex flex-col lg:flex-row items-start gap-4 z-40">
        {/* Player controls container with border */}
        <div className="w-full max-w-[22rem] text-white p-4 border border-white rounded-3xl shadow-lg flex flex-row items-center">
          <div className="flex flex-row items-center justify-center gap-x-2">
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
        </div>
        {/* Separate text box (not inside the bordered player) */}
        <a
          href="https://soundcloud.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-300 hover:text-white hover:underline p-4 flex flex-row flex-nowrap items-center justify-center max-w-full gap-x-3"
        >
          <p className="text-sm whitespace-nowrap">Checkout our music on </p>
          <FontAwesomeIcon
            icon={faSoundcloud}
            className="w-10 h-auto text-orange-500 hover:text-orange-400"
          />
        </a>
      </div>

      {/* Visualizer and progress bar */}
      <div className="mt-16 flex flex-col items-center">
        <div className="flex space-x-1 items-end">
          {barHeights.map((height, index) => {
            // For each bar, compute the boost multiplier and effective sensitivity.
            const boostMultiplier =
              1 + ((barCount - index) / barCount) * (lowFrequencyBoost - 1);
            const effectiveSensitivity = sensitivityFactor * boostMultiplier;
            let computedHeight = Math.max(
              height * effectiveSensitivity,
              baseline
            );
            // --- Apply low-frequency dynamic reaction ---
            if (index < Math.floor(barCount * 0.3)) {
              const bassThreshold = 50;
              if (computedHeight < bassThreshold) {
                computedHeight = baseline + (computedHeight - baseline) * 0.2;
              } else {
                computedHeight = baseline + (computedHeight - baseline) * 1.5;
              }
            }
            const limitedHeight = Math.min(computedHeight, maxHeight);
            const scaleY = limitedHeight / maxHeight;
            return (
              <div
                key={index}
                style={{ height: maxHeight }}
                className="w-[0.8rem] overflow-hidden relative"
              >
                {/* Main bar */}
                <motion.div
                  animate={{ scaleY }}
                  transition={{ type: "spring", stiffness: 1000, damping: 20 }}
                  className="h-full"
                  style={{
                    transformOrigin: "bottom",
                    backgroundColor: getBarColor(index),
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div
          className="mt-2 w-full inline-block cursor-pointer select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          <div className="w-full h-2 bg-gray-300 rounded">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-indigo-800 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAudioVisualizer;
