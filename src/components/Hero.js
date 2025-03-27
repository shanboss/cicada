import PrimaryButton from "./Button";
import WaveAnimation from "./WaveAnimation"; // Import WaveAnimation component
import Carousel from "./EventCarousel";
import EventCarousel from "./EventCarousel";

const Hero = () => {
  return (
    <section className="relative h-[34rem] flex flex-col items-center justify-center text-center text-white overflow-hidden">
      {/* Wave Background */}
      <WaveAnimation duration={1} />
      <WaveAnimation duration={3} />
      <WaveAnimation duration={10} />

      {/* Hero Content (Above Background) */}
    </section>
  );
};

export default Hero;
