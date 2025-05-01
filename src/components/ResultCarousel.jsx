import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTrophy,
  FaMedal,
} from "react-icons/fa";

const images = [
  "/Hriday.png",
  "/Dhyey.png",
  "/Jisha.png",
  "/Jwalin.png",
  "/kenit.png",
  "/Freya.png",
];

// Animation variants for multi-image carousel with slower animations
const containerVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 120, damping: 35, duration: 0.6 },
      opacity: { duration: 0.5 },
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 120, damping: 35, duration: 0.6 },
      opacity: { duration: 0.5 },
    },
  }),
};

// New animation variants for the subheading components
const headingVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.8,
    },
  },
};

const highlightVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
      delay: 0.3,
    },
  },
};

// Individual image animation with slower transitions
const imageVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: { duration: 0.6 },
  },
  tap: {
    scale: 0.98,
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    transition: { duration: 0.4 },
  },
};

export default function ResultCarousel() {
  const [currentGroup, setCurrentGroup] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);
  const [dimensions, setDimensions] = useState({
    width: undefined,
    height: undefined,
  });

  // Calculate the number of image groups (each with 3 images)
  const imagesPerGroup = 3;
  const totalGroups = Math.ceil(images.length / imagesPerGroup);

  // Get current images to display
  const getCurrentImages = useCallback(() => {
    const startIdx = currentGroup * imagesPerGroup;
    return images.slice(startIdx, startIdx + imagesPerGroup);
  }, [currentGroup]);

  // Track window resize for responsive sizing
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    let intervalId;
    if (isAutoPlaying) {
      intervalId = setInterval(() => {
        setDirection(1);
        setCurrentGroup((prev) => (prev === totalGroups - 1 ? 0 : prev + 1));
      }, 5000); // Change slide every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoPlaying, totalGroups]);

  // Navigation functions
  const prevGroup = useCallback(() => {
    setDirection(-1);
    setCurrentGroup((prev) => (prev === 0 ? totalGroups - 1 : prev - 1));
  }, [totalGroups]);

  const nextGroup = useCallback(() => {
    setDirection(1);
    setCurrentGroup((prev) => (prev === totalGroups - 1 ? 0 : prev + 1));
  }, [totalGroups]);

  // Pause auto-play when user interacts
  const handleInteraction = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      nextGroup();
      handleInteraction();
    },
    onSwipedRight: () => {
      prevGroup();
      handleInteraction();
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    swipeDuration: 500,
    trackTouch: true,
  });

  // Calculate optimal container size based on viewport
  const getOptimalSize = useCallback(() => {
    const isMobile = dimensions.width < 640;
    const isTablet = dimensions.width >= 640 && dimensions.width < 1024;

    const maxContainerWidth = dimensions.width * (isMobile ? 0.95 : 0.9);
    // Reduced height for wider format
    const maxContainerHeight = isMobile ? 200 : isTablet ? 250 : 300;

    return {
      width: maxContainerWidth,
      height: maxContainerHeight,
      isMobile,
      isTablet,
    };
  }, [dimensions]);

  const {
    width: containerWidth,
    height: containerHeight,
    isMobile,
    isTablet,
  } = getOptimalSize();

  return (
    <section className="py-10 sm:py-12 bg-gradient-to-b from-gray-50 to-white bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="flex items-center justify-center mb-3">
            <FaTrophy className="text-yellow-500 text-2xl sm:text-3xl mr-3" />
            <h2 className="text-3xl sm:text-4xl font-bold text-green-700">
              Our Results
            </h2>
            <FaMedal className="text-yellow-500 text-2xl sm:text-3xl ml-3" />
          </div>
          <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-500 to-yellow-500 mx-auto rounded-full"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 max-w-2xl mx-auto">
            Celebrating the success of our students - excellence through
            dedicated education
          </p>
        </motion.div>

        {/* Subheading for Class 9th */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={headingVariants}
          className="text-center mb-6"
        >
          <h3 className="text-2xl sm:text-3xl font-semibold text-blue-600">
            Class 9th Achievements
          </h3>
          <motion.div
            variants={highlightVariants}
            className="w-16 sm:w-20 h-1 bg-blue-500 mx-auto mt-2 rounded-full"
          ></motion.div>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Outstanding performance by our Class 9th students in academics and
            extracurricular activities.
          </p>
        </motion.div>

        {/* Multi-Image Carousel Container */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto overflow-hidden "
            style={{
              width: containerWidth,
              height: containerHeight,
            }}
          >
            <div
              {...handlers}
              className="relative w-full h-full flex items-center"
              onClick={handleInteraction}
            >
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentGroup}
                  custom={direction}
                  variants={containerVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-4"
                >
                  {getCurrentImages().map((src, idx) => (
                    <motion.div
                      key={`${currentGroup}-${idx}`}
                      variants={imageVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="flex-1 h-full flex items-center justify-center bg-white  overflow-hidden"
                      style={{
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                        maxWidth: `${
                          100 / imagesPerGroup - (isMobile ? 2 : 4)
                        }%`,
                      }}
                    >
                      <img
                        src={src}
                        alt={`Student success ${
                          currentGroup * imagesPerGroup + idx + 1
                        }`}
                        className="max-w-full max-h-full object-contain p-2"
                        style={{
                          height: isMobile ? "90%" : "85%",
                        }}
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                    </motion.div>
                  ))}

                  {/* Fill in empty slots when needed */}
                  {getCurrentImages().length < imagesPerGroup &&
                    [...Array(imagesPerGroup - getCurrentImages().length)].map(
                      (_, idx) => (
                        <div
                          key={`empty-${idx}`}
                          className="flex-1 invisible"
                          style={{
                            maxWidth: `${
                              100 / imagesPerGroup - (isMobile ? 2 : 4)
                            }%`,
                          }}
                        ></div>
                      )
                    )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <motion.button
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={(e) => {
                  e.stopPropagation();
                  prevGroup();
                  handleInteraction();
                }}
                className="absolute top-1/2 -left-1 sm:left-0 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all duration-300 z-10"
                aria-label="Previous group"
              >
                <FaChevronLeft size={isMobile ? 12 : 16} />
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={(e) => {
                  e.stopPropagation();
                  nextGroup();
                  handleInteraction();
                }}
                className="absolute top-1/2 -right-1 sm:right-0 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all duration-300 z-10"
                aria-label="Next group"
              >
                <FaChevronRight size={isMobile ? 12 : 16} />
              </motion.button>
            </div>
          </motion.div>

          {/* Indicators */}
          <div className="flex justify-center mt-4">
            {[...Array(totalGroups)].map((_, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                onClick={() => {
                  setDirection(idx > currentGroup ? 1 : -1);
                  setCurrentGroup(idx);
                  handleInteraction();
                }}
                className={`w-2 h-2 sm:w-3 sm:h-3 mx-1 rounded-full transition-all duration-300 ${
                  currentGroup === idx
                    ? "bg-green-600 w-4 sm:w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to group ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Caption */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mt-4 sm:mt-6"
        >
          <p className="text-base sm:text-lg text-gray-700">
            <span className="font-semibold">Our students excel</span> in
            competitive exams and academic achievements
          </p>
        </motion.div>
      </div>
    </section>
  );
}
