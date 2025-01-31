"use client";
import { Button } from "@headlessui/react";
import { useRouter } from "next/navigation";
export default function PrimaryButton({ label, link, size = "md" }) {
  const router = useRouter();
  function handleNav() {
    router.push(link);
  }

  return (
    <Button
      onClick={() => handleNav()}
      className={`rounded-md bg-indigo-950 py-2 px-4 text-${size} text-white data-[hover]:bg-blue-800 data-[active]:bg-blue-800`}
    >
      {label}
    </Button>
  );
}
