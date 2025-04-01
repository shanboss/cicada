"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import CheckBox from "./CheckBox";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    gender: "",
    phone_number: "",
    role_preference: "",
    favorite_artist: "",
    favorite_set: "",
    favorite_genre: "",
    cicada_interest: "",
    subscribed: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Single change handler for all inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const {
      email,
      firstName,
      lastName,
      gender,
      phone_number,
      role_preference,
      favorite_artist,
      favorite_set,
      favorite_genre,
      cicada_interest,
      subscribed,
    } = formData;

    // Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Invalid email address! Please enter a valid email. 🚫");
      setLoading(false);
      return;
    }

    try {
      // Insert into Supabase
      const { error } = await supabase.from("subscribers").insert([
        {
          email,
          first_name: firstName,
          last_name: lastName,
          gender,
          phone_number,
          role_preference,
          favorite_artist,
          favorite_set,
          favorite_genre,
          cicada_interest,
          subscribed,
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          setMessage("This email is already registered! 🚫");
        } else {
          console.error("Supabase Insert Error:", error.message);
          setMessage("Error: " + error.message);
        }
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      setMessage("An unexpected error occurred. Please try again.");
    }

    // Send Welcome Email
    await fetch("/api/sendEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName }),
    });
    // Success message
    setMessage("Success! Redirecting to home...");

    // Wait 3 seconds, then navigate to home
    setTimeout(() => {
      router.push("/");
    }, 3000);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center items-center px-6 py-12 lg:px-8 bg-neutral-900 text-neutral-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-4xl font-bold tracking-tight">
          JOIN CICADA
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md bg-neutral-800 p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-300"
            >
              Email Address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Name Fields */}
          <div className="flex flex-row items-center justify-center gap-x-4">
            <div className="w-1/2">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-neutral-300"
              >
                First Name
              </label>
              <div className="mt-2">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="w-1/2">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-neutral-300"
              >
                Last Name
              </label>
              <div className="mt-2">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Phone Number (Optional) */}
          <div>
            <label
              htmlFor="phone_number"
              className="block text-sm font-medium text-neutral-300"
            >
              Phone Number (Optional)
            </label>
            <div className="mt-2">
              <input
                id="phone_number"
                name="phone_number"
                type="text"
                autoComplete="tel"
                value={formData.phone_number}
                onChange={handleChange}
                className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-3">
            <label
              htmlFor="phone_number"
              className="block text-sm font-medium text-neutral-300"
            >
              Gender
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === "male"}
                onChange={handleChange}
                className="form-radio text-blue-600 h-5 w-5"
              />
              <span className="text-sm text-gray-200">Male</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === "female"}
                onChange={handleChange}
                className="form-radio text-pink-600 h-5 w-5"
              />
              <span className="text-sm text-gray-200">Female</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="prefer-not-to-say"
                checked={formData.gender === "prefer-not-to-say"}
                onChange={handleChange}
                className="form-radio text-gray-400 h-5 w-5"
              />
              <span className="text-sm text-gray-200">Prefer not to say</span>
            </label>
          </div>

          {/* Role Preference */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-neutral-300">
              Would you attend Cicada Meetings as a DJ or Raver?
            </p>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="role_preference"
                value="raver"
                checked={formData.role_preference === "raver"}
                onChange={handleChange}
                className="form-radio text-green-600 h-5 w-5"
              />
              <span className="text-sm text-gray-200">Raver</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="role_preference"
                value="DJ"
                checked={formData.role_preference === "DJ"}
                onChange={handleChange}
                className="form-radio text-purple-600 h-5 w-5"
              />
              <span className="text-sm text-gray-200">DJ</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="role_preference"
                value="both"
                checked={formData.role_preference === "both"}
                onChange={handleChange}
                className="form-radio text-yellow-600 h-5 w-5"
              />
              <span className="text-sm text-gray-200">Both</span>
            </label>
          </div>

          {/* Favorite Artist */}
          <div>
            <label
              htmlFor="favorite_artist"
              className="block text-sm font-medium text-neutral-300"
            >
              Favorite Artist
            </label>
            <div className="mt-2">
              <input
                id="favorite_artist"
                name="favorite_artist"
                type="text"
                value={formData.favorite_artist}
                onChange={handleChange}
                className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Favorite Set */}
          <div>
            <label
              htmlFor="favorite_set"
              className="block text-sm font-medium text-neutral-300"
            >
              Favorite Set
            </label>
            <div className="mt-2">
              <input
                id="favorite_set"
                name="favorite_set"
                type="text"
                value={formData.favorite_set}
                onChange={handleChange}
                className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Favorite Genre */}
          <div>
            <label
              htmlFor="favorite_genre"
              className="block text-sm font-medium text-neutral-300"
            >
              Favorite Genre
            </label>
            <div className="mt-2">
              <input
                id="favorite_genre"
                name="favorite_genre"
                type="text"
                value={formData.favorite_genre}
                onChange={handleChange}
                className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Cicada Interest */}
          <div>
            <label
              htmlFor="cicada_interest"
              className="block text-sm font-medium text-neutral-300"
            >
              What would you like to see at future Cicada Meetings
            </label>
            <div className="mt-2">
              <input
                id="cicada_interest"
                name="cicada_interest"
                type="text"
                value={formData.cicada_interest}
                onChange={handleChange}
                className="block w-full rounded-md bg-neutral-700 px-3 py-2 text-white border border-neutral-600 placeholder-neutral-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Checkbox */}
          <CheckBox
            label="Sign up for our mailing list"
            description="Get notified about upcoming events"
            checked={formData.subscribed}
            onChange={handleChange}
            name="subscribed"
          />

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>

          {/* Success/Error Message */}
          {message && <p className="text-center mt-4 text-sm">{message}</p>}
        </form>
      </div>
    </div>
  );
}
