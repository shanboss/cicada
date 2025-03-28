"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import PrimaryButton from "./Button";
import Image from "next/image";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isOpen && !event.target.closest(".mobile-menu")) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <nav className="fixed top-0 w-full bg-black bg-opacity-90 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex flex-row items-center justify-center">
          {/* Logo */}
          <Image
            src="/CicadaLogo.png"
            alt="Cicada Logo"
            width={100}
            height={100}
            className="block"
          />
          <Link href={"/"}>
            <h1 className="text-2xl font-bold tracking-wide hover:cursor-pointer">
              CICADA
            </h1>
          </Link>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center">
          {/* <li>
            <Link
              href="/about"
              className="hover:text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
          </li> */}
          <li>
            <Link
              href="/events"
              className="hover:text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Events
            </Link>
          </li>
          {/* <li>
            <Link
              href="/gallery"
              className="hover:text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Gallery
            </Link>
          </li> */}
          <li onClick={() => setIsOpen(false)}>
            <PrimaryButton label={"Join Now"} link={"/signup"} />
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <Bars3Icon className="h-8 w-8" />
        </button>
      </div>

      {/* Mobile Side Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-black bg-opacity-95 text-white transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 mobile-menu`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
          <button
            className="text-white focus:outline-none"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
        </div>
        <ul className="flex flex-col space-y-4 mt-6 px-6">
          {/* <li>
            <Link
              href="/about"
              className="hover:text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
          </li> */}
          <li>
            <Link
              href="/events"
              className="hover:text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Events
            </Link>
          </li>
          {/* <li>
            <Link
              href="/gallery"
              className="hover:text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Gallery
            </Link>
          </li> */}
          <li onClick={() => setIsOpen(false)}>
            <PrimaryButton label={"Join Now"} link={"/signup"} />
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
