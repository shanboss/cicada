"use client";
import { Canvas } from "@react-three/fiber";
// Hero.jsx
import PrimaryButton from "./Button";
import DotMatrix from "./DotMatrix";
import GlobalAudioVisualizer from "./GlobalAudioVisualizer";
import ThreeDPlayer from "./3DPlayer";
import Object from "./Object";
import Visualizer2 from "./Visualizer2";

const Hero = () => {
  return (
    <section className="relative flex flex-col items-center justify-center text-center text-white overflow-hidden">
      {/* Wave Background */}
      {/* <WaveAnimation duration={1} />
      <WaveAnimation duration={3} />
      <WaveAnimation duration={10} /> */}
      {/* Hero Content (Above Background) */}
      {/* Add your hero content here */}
      <ThreeDPlayer
        src={"/MakeMeFeel.mp3"}
        title={"Vibes curated by Redline"}
      />
      {/* <GlobalAudioVisualizer
        src={"/MakeMeFeel.mp3"}
        title={"Vibes curated by Redline"}
      /> */}
      {/* <Visualizer2 src={"/MakeMeFeel.mp3"} title={"Vibes curated by Redline"} /> */}

      {/*
      <TwistCube /> */}
    </section>
  );
};

export default Hero;
