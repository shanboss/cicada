"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import PrimaryButton from "./Button";
import Image from "next/image";
import { supabase } from "../../lib/supabaseClient";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userInitial, setUserInitial] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Get user and listen to auth state changes
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Fetch profile to get first name and role
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, user_role")
          .eq("id", user.id)
          .single();
        
        // Set initial from profile first, then fallback to user_metadata
        if (profile?.first_name) {
          setUserInitial(profile.first_name.charAt(0).toUpperCase());
        } else if (user?.user_metadata?.first_name) {
          setUserInitial(user.user_metadata.first_name.charAt(0).toUpperCase());
        } else {
          setUserInitial(user?.email?.charAt(0).toUpperCase() || "U");
        }
        
        setIsAdmin(profile?.user_role === "admin" || user.user_metadata?.role === "admin");
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile to get first name and role
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, user_role")
          .eq("id", session.user.id)
          .single();
        
        // Set initial from profile first, then fallback to user_metadata
        if (profile?.first_name) {
          setUserInitial(profile.first_name.charAt(0).toUpperCase());
        } else if (session.user?.user_metadata?.first_name) {
          setUserInitial(session.user.user_metadata.first_name.charAt(0).toUpperCase());
        } else {
          setUserInitial(session.user?.email?.charAt(0).toUpperCase() || "U");
        }
        
        setIsAdmin(profile?.user_role === "admin" || session.user.user_metadata?.role === "admin");
      } else {
        setUserInitial("");
        setIsAdmin(false);
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserInitial("");
  };

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
        <Link href="/" className="flex flex-row items-center justify-center">
          {/* Logo */}
          <Image
            src="/CicadaLogo.png"
            alt="Cicada Logo"
            width={100}
            height={100}
            className="block"
          />
          <div>
            <h1 className="text-2xl font-bold tracking-wide hover:cursor-pointer">
              CICADA
            </h1>
          </div>
        </Link>

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
          <li>
            <Link
              href="/my-tickets"
              className="hover:text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              My Tickets
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                className="hover:text-gray-400"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            </li>
          )}
          {/* <li>
            <Link
              href="/gallery"
              className="hover:text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Gallery
            </Link>
          </li> */}
          {!user ? (
            <>
              <li>
                <Link
                  href="/signin"
                  className="hover:text-gray-400 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              </li>
              <li onClick={() => setIsOpen(false)}>
                <PrimaryButton label={"Join Now"} link={"/signup"} />
              </li>
            </>
          ) : (
            <li className="relative group">
              <Link
                href="/profile"
                className="w-10 h-10 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center hover:bg-indigo-500 transition-colors"
                aria-label="User profile"
              >
                {userInitial || "U"}
              </Link>
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-32 bg-neutral-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </li>
          )}
          <li>
            <a
              href="https://www.instagram.com/cicada.dtx/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-400 transition-colors duration-200"
              aria-label="Instagram"
            >
              <FontAwesomeIcon icon={faInstagram} className="w-6 h-6" />
            </a>
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
          <li>
            <Link
              href="/my-tickets"
              className="hover:text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              My Tickets
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                className="hover:text-gray-400"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            </li>
          )}
          {/* <li>
            <Link
              href="/gallery"
              className="hover:text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Gallery
            </Link>
          </li> */}
          {!user ? (
            <>
              <li>
                <Link
                  href="/signin"
                  className="hover:text-gray-400 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              </li>
              <li onClick={() => setIsOpen(false)}>
                <PrimaryButton label={"Join Now"} link={"/signup"} />
              </li>
            </>
          ) : (
            <>
              <li>
                <div className="flex items-center space-x-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center">
                    {userInitial || "U"}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      {user?.user_metadata?.first_name}{" "}
                      {user?.user_metadata?.last_name}
                    </p>
                    <p className="text-xs text-neutral-400">{user?.email}</p>
                  </div>
                </div>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  My Profile
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-indigo-400 hover:bg-neutral-700 rounded"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 rounded"
                >
                  Sign Out
                </button>
              </li>
            </>
          )}
          <li>
            <a
              href="https://www.instagram.com/cicada.dtx/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 hover:text-pink-400 transition-colors duration-200"
              aria-label="Instagram"
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon icon={faInstagram} className="w-6 h-6" />
              <span>Instagram</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
