import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Events from "@/components/Events";
import Membership from "@/components/Membership";
import Footer from "@/components/Footer";
import WaveAnimation from "@/components/WaveAnimation";
import Visualizer2 from "@/components/Visualizer2";

export default function Home() {
  const imagesArray = ["/gallery/img2.HEIC", "/gallery/img1.jpg"];

  return (
    <div className="bg-black text-white">
      <Events />
      <About />
      <Membership />
    </div>
  );
}
