"use client";
import React from "react";
import { AudioVisualizer } from "react-music-visualizer";

export default function page() {
  return (
    <div className="duration-300">
      <AudioVisualizer
        song="/Gimme That Bounce.mp3"
        showPlayer={true}
        showScrubber={true}
        height={400}
        color="#8a42f5"
        numBars={100}
        sampleRate={44100}
        fftSize={4096}
        startFreq={1}
        endFreq={20000}
        graphStyle="centered"
        barStyle="rounded"
        gapWidth={1}
      />
    </div>
  );
}
