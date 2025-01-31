import Link from "next/link";
import PrimaryButton from "./Button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-black bg-opacity-90 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href={"/"}>
          <h1 className="text-2xl font-bold tracking-wide hover:cursor-pointer">
            CICADA
          </h1>
        </Link>

        <ul className="hidden md:flex space-x-6 items-center">
          <li>
            <Link href="#about" className="hover:text-gray-400">
              About
            </Link>
          </li>
          <li>
            <Link href="#events" className="hover:text-gray-400">
              Events
            </Link>
          </li>
          <li>
            <Link href="#gallery" className="hover:text-gray-400">
              Gallery
            </Link>
          </li>
          <li>
            <PrimaryButton label={"Join Now"} link={"/signup"} />
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
