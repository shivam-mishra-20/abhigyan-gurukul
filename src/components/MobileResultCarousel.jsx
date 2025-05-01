import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTrophy,
  FaMedal,
} from "react-icons/fa";

// Student result images
const images = [
  "/Hriday.png",
  "/Dhyey.png",
  "/Jisha.png",
  "/Jwalin.png",
  "/kenit.png",
  "/Freya.png",
];

// Animation variants optimized for mobile
const containerVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "80%" : "-80%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 100, damping: 25, duration: 0.5 },
      opacity: { duration: 0.4 },
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? "80%" : "-80%",
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 100, damping: 25, duration: 0.5 },
      opacity: { duration: 0.4 },
    },
  }),
};

// Individual image animation
const imageVariants = {
  hover: {
    scale: 1.03,
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    transition: { duration: 0.5 },
  },
  tap: {
    scale: 0.97,
    transition: { duration: 0.3 },
  },
};

// Title animation variants
const titleVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function MobileResultCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    let intervalId;
    if (isAutoPlaying) {
      intervalId = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }, 4000); // Slightly faster for mobile attention spans
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoPlaying]);

  // Navigation functions
  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, []);

  // Pause auto-play when user interacts
  const handleInteraction = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  // Swipe handlers with optimized sensitivity for mobile
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      nextSlide();
      handleInteraction();
    },
    onSwipedRight: () => {
      prevSlide();
      handleInteraction();
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false, // Disable on mobile for better performance
    swipeDuration: 300,
    trackTouch: true,
    delta: 10, // Lower threshold for better response
  });

  return (
    <section className="py-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="px-4">
        {/* Section Header - Mobile Optimized */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={titleVariants}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center mb-2">
            <FaTrophy className="text-yellow-500 text-xl mr-2" />
            <h2 className="text-2xl font-bold text-green-700">Our Results</h2>
            <FaMedal className="text-yellow-500 text-xl ml-2" />
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-yellow-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Class Title - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-5 text-center"
        >
          <h3 className="text-xl font-semibold text-blue-600 inline-block relative">
            <span className="relative z-10">Class 9th</span>
            <span
              className="absolute bottom-0 left-0 h-2 bg-yellow-200 w-full z-0 rounded-sm"
              style={{ opacity: 0.6 }}
            ></span>
          </h3>

          {/* Key Stats - Mobile Friendly Layout */}
          <div className="flex justify-center mt-3 gap-3">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 px-2 py-1 rounded-lg shadow-sm border border-green-100 text-xs">
              <span className="text-green-700 font-semibold">90%+</span>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 px-2 py-1 rounded-lg shadow-sm border border-green-100 text-xs">
              <span className="text-green-700 font-semibold">100%</span> Pass
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 px-2 py-1 rounded-lg shadow-sm border border-green-100 text-xs">
              <span className="text-green-700 font-semibold">6</span> Toppers
            </div>
          </div>
        </motion.div>

        {/* Mobile-Optimized Carousel */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto overflow-hidden rounded-lg shadow-lg"
            style={{
              width: Math.min(dimensions.width - 32, 500), // Max width with padding
              height: Math.min(dimensions.width * 0.8, 300), // Maintain aspect ratio
            }}
          >
            <div
              {...handlers}
              className="relative w-full h-full flex items-center bg-gray-50"
              onClick={handleInteraction}
            >
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={containerVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    variants={imageVariants}
                    whileTap="tap"
                    className="w-[90%] h-[90%] flex items-center justify-center bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <img
                      src={images[currentIndex]}
                      alt={`Student success ${currentIndex + 1}`}
                      className="max-w-full max-h-full object-contain p-1"
                      loading={currentIndex === 0 ? "eager" : "lazy"}
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows - Mobile Sized */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                  handleInteraction();
                }}
                className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-black/30 text-white p-1.5 rounded-full hover:bg-black/50 transition-all duration-300 z-10"
                aria-label="Previous"
              >
                <FaChevronLeft size={14} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                  handleInteraction();
                }}
                className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-black/30 text-white p-1.5 rounded-full hover:bg-black/50 transition-all duration-300 z-10"
                aria-label="Next"
              >
                <FaChevronRight size={14} />
              </motion.button>
            </div>
          </motion.div>

          {/* Indicators - Mobile Friendly Size */}
          <div className="flex justify-center mt-3">
            {images.map((_, idx) => (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                  handleInteraction();
                }}
                className={`mx-1 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? "bg-green-600 w-3 h-2"
                    : "bg-gray-300 w-2 h-2"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Caption - Mobile Sized */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-4"
        >
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Our students excel</span> in
            competitive exams
          </p>
        </motion.div>
      </div>
    </section>
  );
}
