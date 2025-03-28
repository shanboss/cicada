import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

const GlobalAudioVisualizer = ({ src, title }) => {
  // State for play/pause, progress, and drag seeking
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Visualizer constants
  const baseline = 2; // minimum “base” height (in pixels) always visible
  const barCount = 70; // number of bars (frequency groups)
  const sensitivityFactor = 1; // amplifies the frequency data reaction
  const maxHeight = 400; // maximum height (in pixels) for each bar

  // New parameters to control which part of the frequency spectrum to display:
  // Process only the bins between startBinRatio and endBinRatio.
  const startBinRatio = 0.5; // start at the beginning of the frequency data
  const endBinRatio = 0.6; // process only the lower 30% of bins
  const lowFrequencyBoost = 2;

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

  // Setup Web Audio API on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    analyzerRef.current = audioContextRef.current.createAnalyser();
    // Using a larger fftSize for more frequency bins
    analyzerRef.current.fftSize = 512;
    const bufferLength = analyzerRef.current.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    // Connect the audio element to the analyzer and then to the speakers
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
  // The gradient stops are:purple, blue
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

    // Convert to hex color string.
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Animation loop for updating frequency data
  const animate = () => {
    if (analyzerRef.current) {
      analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
      const totalBins = dataArrayRef.current.length;
      // Define the start and end bin based on our ratios
      const startBin = Math.floor(totalBins * startBinRatio);
      const endBin = Math.floor(totalBins * endBinRatio);
      const processedBinCount = endBin - startBin;
      // Avoid division by zero by ensuring a minimum step of 1
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
          // Calculate boost multiplier and effective sensitivity
          const boostMultiplier =
            1 + ((barCount - i) / barCount) * (lowFrequencyBoost - 1);
          const effectiveSensitivity = sensitivityFactor * boostMultiplier;
          // Compute the effective height (with baseline and max limits)
          let effectiveHeight = Math.max(
            newBarHeights[i] * effectiveSensitivity,
            baseline
          );
          effectiveHeight = Math.min(effectiveHeight, maxHeight);
          // Update the peak: if the new effective height is higher than the peak, update immediately.
          // Otherwise, decay the peak slowly (e.g., by 2 units per frame).
          if (effectiveHeight > peak) {
            return effectiveHeight;
          } else {
            return Math.max(effectiveHeight, peak - 2);
          }
        })
      );
    }
    animationIdRef.current = requestAnimationFrame(animate);
  };

  // Toggle playback and start/stop the animation loop
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animationIdRef.current);
      // Reset bars to baseline when paused
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

  // Update progress based on the audio's current time
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  // Functions to support click and drag seeking on the progress bar
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
    <>
      {/* Player controls */}
      <div className="fixed top-[7rem] left-[10rem] z-50 text-white p-4 border border-white rounded-3xl shadow-lg flex flex-row items-center">
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

      {/* Visualizer and progress bar */}
      <div className="mt-16 flex flex-col items-center">
        <div className="flex space-x-1 items-end">
          {barHeights.map((height, index) => {
            // For each bar, compute a boost multiplier so that lower frequencies (leftmost bars) get extra amplification.
            const boostMultiplier =
              1 + ((barCount - index) / barCount) * (lowFrequencyBoost - 1);
            const effectiveSensitivity = sensitivityFactor * boostMultiplier;
            const computedHeight = Math.max(
              height * effectiveSensitivity,
              baseline
            );
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
                {/* Peak indicator */}
                <div
                  className="absolute left-0 right-0 h-[2px] bg-black"
                  style={{
                    // Position the peak indicator relative to the container.
                    // (peakHeights[index] / maxHeight)*100 gives a percentage value.
                    bottom: `${(peakHeights[index] / maxHeight) * 100}%`,
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
    </>
  );
};

export default GlobalAudioVisualizer;
