"use client";
import React, { useEffect, useRef } from "react";

let audioContext; // Declare a global variable to share the AudioContext

const GlobalAudioVisualizer = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Wait for the audio element to be available
    const audioElement = document.getElementById("global-audio");
    if (!audioElement) {
      console.warn("No audio element found with id 'global-audio'");
      return;
    }

    // Create the AudioContext only if it hasn't been created yet
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    let source;
    try {
      // This creates a MediaElementAudioSourceNode. Note: Only one call is allowed per element!
      source = audioContext.createMediaElementSource(audioElement);
    } catch (error) {
      console.error("Error creating MediaElementAudioSourceNode:", error);
      return;
    }

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Connect the source to the analyser, then to the destination
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear the canvas
      canvasCtx.fillStyle = "rgb(0, 0, 0)";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        canvasCtx.fillStyle = `rgb(${barHeight + 100},50,50)`;
        canvasCtx.fillRect(
          x,
          canvas.height - barHeight / 2,
          barWidth,
          barHeight / 2
        );
        x += barWidth + 1;
      }
    };

    draw();

    // Clean-up if needed
    return () => {
      // You might want to disconnect nodes here
    };
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        style={{ display: "block", margin: "20px auto" }}
      />
    </div>
  );
};

export default GlobalAudioVisualizer;
