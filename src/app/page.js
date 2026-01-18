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

export const metadata = {
  title: "Cicada Music Society | Home",
  description:
    "Welcome to Cicada Music Society. Discover upcoming events, join our community, and experience the best in music.",
  openGraph: {
    title: "Cicada Music Society | Home",
    description:
      "Welcome to Cicada Music Society. Discover upcoming events, join our community, and experience the best in music.",
  },
};

export default function Home() {
  const imagesArray = ["/gallery/img2.HEIC", "/gallery/img1.jpg"];

  return (
    <div className="bg-black text-white">
      <Hero />
      <Events />
      <About />
      <Membership />
    </div>
  );
}
