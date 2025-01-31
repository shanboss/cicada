import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Events from "@/components/Events";
import Membership from "@/components/Membership";
import Footer from "@/components/Footer";
import WaveAnimation from "@/components/WaveAnimation";

export default function Home() {
  return (
    <div className="bg-black text-white">
      <Hero />
      <WaveAnimation />
      <About />
      <Events />
      <Gallery />
      <Membership />
    </div>
  );
}
