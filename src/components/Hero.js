import PrimaryButton from "./Button";
import WaveAnimation from "./WaveAnimation"; // Import WaveAnimation component

const Hero = () => {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center text-white bg-black overflow-hidden">
      {/* Wave Background */}
      <WaveAnimation />

      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* Hero Content (Above Background) */}
      <div className="relative z-10 flex flex-col items-center">
        <img src="/logo.jpeg" alt="Cicada Logo" className="w-32 h-32 mb-4" />
        <h1 className="text-6xl font-extrabold">CICADA</h1>
        <p className="text-xl mt-4 text-gray-300">
          Electronic Music Society at UTD
        </p>
        <div className="my-4">
          <PrimaryButton label={"Join Us"} link={"/membership"} size="lg" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
