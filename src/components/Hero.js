import PrimaryButton from "./Button";
import WaveAnimation from "./WaveAnimation"; // Import WaveAnimation component

const Hero = () => {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center text-white overflow-hidden">
      {/* Wave Background */}
      <WaveAnimation duration={1} />
      <WaveAnimation duration={3} />
      <WaveAnimation duration={10} />

      {/* Overlay for better text visibility */}
      <div className="absolute inset-0"></div>

      {/* Hero Content (Above Background) */}
      <div className="relative z-10 flex flex-col items-center">
        <img src="/logo.jpeg" alt="Cicada Logo" className="w-32 h-32 mb-4" />
        <h1 className="text-6xl font-extrabold">CICADA</h1>
        <p className="text-xl mt-4 text-gray-300">
          Electronic Music Society at UTD
        </p>
        <div className="my-4">
          <PrimaryButton label={"Join Us"} link={"/signup"} size="lg" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
