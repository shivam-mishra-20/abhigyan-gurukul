import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "https://via.placeholder.com/1200x600/FF5733/FFFFFF?text=Image+1",
  "https://via.placeholder.com/1200x600/33FF57/FFFFFF?text=Image+2",
  "https://via.placeholder.com/1200x600/3357FF/FFFFFF?text=Image+3",
];

export default function MobileCarousel() {
  const [index, setIndex] = useState(0);

  const nextSlide = () => setIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative w-full max-w-xs mx-auto overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt={`Slide ${index + 1}`}
          className="w-full max-w-full h-48 sm:h-64 md:h-80 object-cover rounded-xl"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>

      <button
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-gray-800/50 text-white p-2 rounded-full"
        onClick={prevSlide}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-gray-800/50 text-white p-2 rounded-full"
        onClick={nextSlide}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
