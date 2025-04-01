"use client";
import { Canvas } from "@react-three/fiber";
// Hero.jsx
import PrimaryButton from "./Button";
import DotMatrix from "./DotMatrix";
import GlobalAudioVisualizer from "./GlobalAudioVisualizer";
import Object from "./Object";

import WaveAnimation from "./WaveAnimation";
import TwistCube from "./TwistCube";

const Hero = () => {
  return (
    <section className="relative h-[34rem] flex flex-col items-center justify-center text-center text-white overflow-hidden">
      {/* Wave Background */}
      {/* <WaveAnimation duration={1} />
      <WaveAnimation duration={3} />
      <WaveAnimation duration={10} /> */}
      {/* Hero Content (Above Background) */}
      {/* Add your hero content here */}
      <GlobalAudioVisualizer
        src={"/MakeMeFeel.mp3"}
        title={"Vibes curated by Redline"}
      />

      {/* <Object />
      <TwistCube /> */}
    </section>
  );
};

export default Hero;
