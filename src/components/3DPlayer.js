import React, { useState, useRef, useEffect } from "react";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSoundcloud } from "@fortawesome/free-brands-svg-icons";
import Object from "./Object"; // Your 3D model component

const ThreeDPlayer = ({ src, title }) => {
  // State for play/pause, progress, and drag seeking
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  // New state: amplitude from the audio frequency data (0 - 255)
  const [amplitude, setAmplitude] = useState(0);

  // References for audio element and Web Audio API nodes
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);

  // Setup audio context and analyzer on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Create AudioContext and analyzer
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyzer = audioContextRef.current.createAnalyser();
    analyzer.fftSize = 256; // Smaller fftSize gives fewer bins; adjust as needed.
    analyzerRef.current = analyzer;
    // Connect the audio element to the analyzer and then to the destination
    const source = audioContextRef.current.createMediaElementSource(audio);
    source.connect(analyzer);
    analyzer.connect(audioContextRef.current.destination);
    dataArrayRef.current = new Uint8Array(analyzer.frequencyBinCount);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Animation loop to update amplitude from the analyzer
  useEffect(() => {
    let animationFrameId;
    const updateAmplitude = () => {
      if (analyzerRef.current && dataArrayRef.current) {
        analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
        // Calculate the average amplitude over all frequency bins
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        const avg = sum / dataArrayRef.current.length;
        setAmplitude(avg);
      }
      animationFrameId = requestAnimationFrame(updateAmplitude);
    };
    updateAmplitude();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Toggle playback of the audio element.
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (
        audioContextRef.current &&
        audioContextRef.current.state === "suspended"
      ) {
        await audioContextRef.current.resume();
      }
      audio.play();
      setIsPlaying(true);
    }
  };

  // Update progress as the audio plays.
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
    <div className="relative w-full h-full px-10">
      {/* Top controls and metadata */}
      <div className="pt-10 top-[2rem] lg:top-[3rem] left-[2rem] flex flex-col lg:flex-row items-start gap-4 z-40">
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
        <a
          href="https://on.soundcloud.com/rG68NtRTzKfzV1Y49"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-300 hover:text-white hover:underline p-4 flex flex-row flex-nowrap items-center justify-center max-w-full gap-x-3"
        >
          <p className="text-sm whitespace-nowrap">Checkout our music on</p>
          <FontAwesomeIcon
            icon={faSoundcloud}
            className="w-10 h-auto text-orange-500 hover:text-orange-400"
          />
        </a>
      </div>

      {/* 3D Object and progress bar */}
      <div className="w-full h-[30rem] flex flex-col items-center">
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
        {/* Pass the amplitude value to the 3D Object component */}
        <Object amplitude={amplitude} />
      </div>
    </div>
  );
};

export default ThreeDPlayer;
