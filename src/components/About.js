import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const About = () => {
  return (
    <section id="about" className="text-center bg-gray-900 text-white">
      <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
        <img
          alt=""
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=focalpoint&fp-y=.8&w=2830&h=1500&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
          />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">
            About Us
          </h2>
          <p className="mt-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
            Cicada is a student-led electronic music society focused on DJing,
            music production, and live performances. We host events, workshops,
            and jam sessions for enthusiasts and beginners alike.
          </p>
          <a
            href="https://discord.gg/jyYtWNr9"
            className="mt-8 inline-flex items-center gap-x-2 justify-center hover:text-indigo-400"
          >
            Join our Discord!{" "}
            <FontAwesomeIcon icon={faDiscord} className="w-8 h-auto" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default About;
