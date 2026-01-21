
import Hero from "@/components/Hero";
import About from "@/components/About";

import Events from "@/components/Events";
import Membership from "@/components/Membership";


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
    <div className="bg-black text-white">
      <Events />

    </div>
  );
}
