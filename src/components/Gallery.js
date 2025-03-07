"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Gallery = ({ images = [] }) => {
  // Default images to an empty array
  const [loadedImagesCount, setLoadedImagesCount] = useState(0);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const imageVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const handleImageLoaded = () => {
    setLoadedImagesCount((prevCount) => prevCount + 1);
  };

  const allImagesLoaded =
    images.length > 0 && loadedImagesCount === images.length;

  return (
    <motion.div
      className="grid grid-cols-3 gap-2"
      variants={containerVariants}
      initial="hidden"
      animate={allImagesLoaded ? "visible" : "hidden"}
    >
      {images.map((src, index) => (
        <motion.img
          key={index} // Use index instead of src if src might not be unique
          src={src}
          alt={`Photo ${index}`}
          className="w-full h-auto object-cover"
          variants={imageVariants}
          onLoad={handleImageLoaded}
        />
      ))}
    </motion.div>
  );
};

export default Gallery;
