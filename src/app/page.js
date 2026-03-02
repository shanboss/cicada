import Hero from "@/components/Hero";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Events from "@/components/Events";
import Membership from "@/components/Membership";
import VideoOverlay from "@/components/VideoOverlay";

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
  return (
    <div className="relative bg-black text-white">
      <VideoOverlay src="/cicadaTrailer.mp4" />

      <div className="relative z-10">
        <Gallery />
        <Events />
      </div>
    </div>
  );
}
