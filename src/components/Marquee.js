"use client";

const messages = [
  "Cicada Music Society",
  "Underground sounds and late-night vibes",
  "Join the community",
  "Become a member today",
  "Upcoming events",
  "Live DJs",
  "Immersive experiences",
  "Follow us on social",
  "Stay in the loop",
];

const Marquee = () => {
  return (
    <section className="relative w-full py-4 border-y border-white/10 bg-black">
      <div className="overflow-hidden">
        <div className="animate-[marquee_25s_linear_infinite] whitespace-nowrap text-sm sm:text-base tracking-[0.25em] uppercase text-white/70">
          {messages.map((msg, idx) => (
            <span key={idx} className="inline-flex items-center gap-4 pr-6">
              <span>{msg}</span>
              <img
                src="/newLogo.png"
                alt="Cicada logo"
                className="h-6 w-auto object-contain"
              />
            </span>
          ))}
          {messages.map((msg, idx) => (
            <span key={`dup-${idx}`} className="inline-flex items-center gap-4">
              <span>{msg}</span>
              <img
                src="/newLogo.png"
                alt="Cicada logo"
                className="h-6 w-auto object-contain"
              />
            </span>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
};

export default Marquee;
