import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ImageCarousel = () => {
  // Image paths
  const images = ["/Photo.png", "/Photo2.jpg", "/placeholder.png"]; // Replace with actual paths

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate images every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <>
      <hr class="mt-30 mb-20 border-t-1 border-black opacity-[18%] my-4" />

      <div className="relative w-full h-150 overflow-hidden">
        {/* Image Container (Full Screen) */}
        <div className="w-full h-full relative flex justify-center items-center">
          <AnimatePresence>
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              className="absolute w-full h-full object-cover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`h-3 w-3 rounded-full ${
                index === currentIndex
                  ? "bg-green-500 scale-125"
                  : "bg-gray-300"
              } transition-transform duration-300`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ImageCarousel;
