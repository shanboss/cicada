import Gallery from "@/components/Gallery";
import Marquee from "@/components/Marquee";
import Events from "@/components/Events";
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
      <VideoOverlay src="/CicadaTrailer.mp4" />

      <div className="relative z-10">
        <Gallery />
        <Marquee />
        <Events />
      </div>
    </div>
  );
}
