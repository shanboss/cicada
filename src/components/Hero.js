"use client";
// Hero.jsx
import PrimaryButton from "./Button";
import DotMatrix from "./DotMatrix";
import GlobalAudioVisualizer from "./GlobalAudioVisualizer";

import WaveAnimation from "./WaveAnimation";

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
        src={"/Summertime Blues.wav"}
        title={"Vibes curated by Redline"}
      />
    </section>
  );
};

export default Hero;
