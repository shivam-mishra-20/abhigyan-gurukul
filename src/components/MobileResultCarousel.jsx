/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTrophy,
  FaMedal,
  FaStar,
  FaGraduationCap,
} from "react-icons/fa";

// Enhanced student data with subject and score information
const studentData = [
  {
    name: "Hriday",
    image: "/Hriday.png",
    subject: "Mathematics",
    score: "98%",
  },
  {
    name: "Dhyey",
    image: "/Dhyey.png",
    subject: "Mathematics",
    score: "96%",
  },
  {
    name: "Jisha",
    image: "/Jisha.png",
    subject: "Mathematics",
    score: "95%",
  },
  {
    name: "Jwalin",
    image: "/Jwalin.png",
    subject: "Mathematics",
    score: "97%",
  },
  {
    name: "Kenit",
    image: "/kenit.png",
    subject: "Mathematics",
    score: "99%",
  },
  {
    name: "Freya",
    image: "/Freya.png",
    subject: "Mathematics",
    score: "94%",
  },
];

// Animation variants optimized for mobile
const containerVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "50%" : "-50%",
    opacity: 0,
    scale: 0.92,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30, duration: 0.5 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4, ease: "easeOut" },
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? "50%" : "-50%",
    opacity: 0,
    scale: 0.92,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30, duration: 0.5 },
      opacity: { duration: 0.3 },
      scale: { duration: 0.3 },
    },
  }),
};

// Individual image animation
const imageVariants = {
  hover: {
    scale: 1.03,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: { duration: 0.4 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.2 },
  },
};

// Title animation variants
const titleVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const statsVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 },
  },
};

const statItemVariants = {
  hidden: { opacity: 0, y: 10 },
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
    width: typeof window !== "undefined" ? window.innerWidth : 375,
    height: typeof window !== "undefined" ? window.innerHeight : 667,
  });

  // Track window resize
  useEffect(() => {
    if (typeof window === "undefined") return;

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
        setCurrentIndex((prev) =>
          prev === studentData.length - 1 ? 0 : prev + 1
        );
      }, 5000); // Slightly faster for mobile attention spans
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoPlaying]);

  // Navigation functions
  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? studentData.length - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === studentData.length - 1 ? 0 : prev + 1));
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

  const currentStudent = studentData[currentIndex];

  return (
    <section className="py-12 bg-gradient-to-b from-green-50 to-white overflow-hidden">
      <div className="px-4 relative">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-green-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
        <div className="absolute top-10 right-0 w-20 h-20 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        {/* Section Header - Mobile Optimized */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={titleVariants}
          className="text-center mb-8"
        >
          <div className="inline-block bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-2 rounded-full shadow-sm mb-2">
            <div className="flex items-center justify-center">
              <FaTrophy className="text-amber-500 text-xl mr-2" />
              <h2 className="text-2xl font-bold text-green-700">Our Results</h2>
              <FaMedal className="text-amber-500 text-xl ml-2" />
            </div>
          </div>
          <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Class Title - Mobile Optimized */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={statsVariants}
          className="mb-6 text-center"
        >
          <div className="flex items-center justify-center mb-3">
            <FaGraduationCap className="text-green-600 mr-2" />
            <h3 className="text-xl font-semibold text-green-800">
              Class 9th Achievements
            </h3>
          </div>

          {/* Key Stats - Mobile Friendly Layout */}
          <div className="flex justify-center gap-3">
            <motion.div
              className="bg-gradient-to-br from-green-50 to-emerald-50 px-3 py-2 rounded-lg shadow-sm border border-green-100"
              variants={statItemVariants}
            >
              <p className="text-xs text-green-500 font-medium">Top Scores</p>
              <p className="text-green-700 font-bold text-lg">90%+</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-green-50 to-emerald-50 px-3 py-2 rounded-lg shadow-sm border border-green-100"
              variants={statItemVariants}
            >
              <p className="text-xs text-green-500 font-medium">Pass Rate</p>
              <p className="text-green-700 font-bold text-lg">100%</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-green-50 to-emerald-50 px-3 py-2 rounded-lg shadow-sm border border-green-100"
              variants={statItemVariants}
            >
              <p className="text-xs text-green-500 font-medium">Toppers</p>
              <p className="text-green-700 font-bold text-lg">6</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile-Optimized Carousel - Simplified */}
        <div className="relative mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto overflow-hidden rounded-2xl shadow-lg bg-white"
            style={{
              width: Math.min(dimensions.width - 32, 500), // Max width with padding
              height: Math.min(dimensions.width * 0.9, 380), // Reduced height for simpler cards
            }}
          >
            <div
              {...handlers}
              className="relative w-full h-full flex flex-col bg-white"
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
                  className="absolute inset-0 flex flex-col items-center p-3" // reduced padding
                >
                  {/* Student Name Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="w-full mb-2 p-2 border-b border-green-50" // Added border like desktop version
                  >
                    <h4 className="text-xl font-bold text-green-800 text-center">
                      {currentStudent.name}
                    </h4>
                  </motion.div>

                  {/* Student Image - Simplified */}
                  <motion.div
                    variants={imageVariants}
                    whileTap="tap"
                    className="w-full flex-1 bg-gradient-to-b from-green-50 to-white rounded-xl overflow-hidden flex items-center justify-center p-2"
                  >
                    <img
                      src={currentStudent.image}
                      alt={currentStudent.name}
                      className="max-w-full max-h-full object-contain"
                      loading={currentIndex === 0 ? "eager" : "lazy"}
                    />
                  </motion.div>

                  {/* Subject and Score - Simplified */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="w-full mt-2 p-2" // reduced margin and padding
                  >
                    <div className="mb-2">
                      {" "}
                      {/* Matching desktop layout */}
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Subject
                      </div>
                      <div className="font-medium text-gray-800">
                        {currentStudent.subject}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Score
                      </div>
                      <div className="font-bold text-green-600 text-lg">
                        {currentStudent.score}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.5)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                  handleInteraction();
                }}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all duration-300 z-10"
                aria-label="Previous"
              >
                <FaChevronLeft size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.5)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                  handleInteraction();
                }}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all duration-300 z-10"
                aria-label="Next"
              >
                <FaChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>

          {/* Indicators - Modern Design */}
          <div className="flex justify-center mt-4 gap-2">
            {studentData.map((_, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                  handleInteraction();
                }}
                className={`transition-all duration-200 ${
                  currentIndex === idx
                    ? "bg-green-600 w-6 h-2"
                    : "bg-gray-300 w-2 h-2"
                } rounded-full`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Caption */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-6"
        >
          <div className="inline-block bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg shadow-sm">
            <p className="text-sm text-green-800">
              <span className="font-semibold">
                Our students consistently excel
              </span>{" "}
              in competitive exams and board results
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
