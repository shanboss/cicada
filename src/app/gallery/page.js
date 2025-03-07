import Gallery from "@/components/Gallery";
import React from "react";

export default function page() {
  const imagesArray = ["/gallery/img1.heic", "/gallery/img2.heic"];
  return (
    <div>
      <Gallery images={imagesArray} />
    </div>
  );
}
