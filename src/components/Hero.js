"use client";
import Image from "next/image";

import DotMatrix from "./DotMatrix";

const Hero = () => {
  return (
    <div className="mt-20 flex flex-col">
      <Image
        src="/newLogo.png"
        className="ml-auto"
        alt="Hero"
        width={200}
        height={200}
      />
      <div className="flex flex-col items-start">
        <h2 className="text-2xl">We are</h2>
        <h1 className="text-5xl text-indigo-700">Cicada</h1>
      </div>
    </div>
  );
};

export default Hero;
