/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrophy,
  FaMedal,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaGraduationCap,
} from "react-icons/fa";

const studentAchievements = [
  {
    id: 1,
    name: "Hriday",
    imageSrc: "/Hriday.png",
    achievement: "Top scorer in Mathematics Olympiad",
    score: "98%",
    rank: "School Topper",
    subject: "Mathematics",
  },
  {
    id: 2,
    name: "Dhyey",
    imageSrc: "/Dhyey.png",
    achievement: "First place in Science Exhibition",
    score: "96%",
    rank: "District Rank 2",
    subject: "Mathematics",
  },
  {
    id: 3,
    name: "Jisha",
    imageSrc: "/Jisha.png",
    achievement: "Excellence in Literary Competition",
    score: "95%",
    rank: "School Rank 3",
    subject: "Mathematics",
  },
  {
    id: 4,
    name: "Jwalin",
    imageSrc: "/Jwalin.png",
    achievement: "Outstanding performance in Regional Quiz",
    score: "97%",
    rank: "State Merit List",
    subject: "Mathematics",
  },
  {
    id: 5,
    name: "Kenit",
    imageSrc: "/kenit.png",
    achievement: "National level Chess Champion",
    score: "99%",
    rank: "State Topper",
    subject: "Mathematics",
  },
  {
    id: 6,
    name: "Freya",
    imageSrc: "/Freya.png",
    achievement: "Gold medalist in Inter-school Debate",
    score: "94%",
    rank: "School Merit List",
    subject: "Mathematics",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
  hover: {
    scale: 1.03,
    y: -5,
    boxShadow: "0 10px 25px rgba(22, 163, 74, 0.15)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const ResultCarousel = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [direction, setDirection] = useState(0);
  const carouselRef = useRef(null);

  // Track window resize for responsiveness
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate how many slides to show based on screen width
  const getSlidesPerView = () => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  };

  const slidesPerView = getSlidesPerView();
  const totalSlides = Math.ceil(studentAchievements.length / slidesPerView);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [autoplay, currentSlide]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const pauseAutoplay = () => {
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? -500 : 500,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
      },
    }),
  };

  const renderSlideContent = (slideIndex) => {
    const startIndex = slideIndex * slidesPerView;
    const endIndex = Math.min(
      startIndex + slidesPerView,
      studentAchievements.length
    );
    const slideStudents = studentAchievements.slice(startIndex, endIndex);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {" "}
        {/* Reduced gap from 6 to 3 */}
        {slideStudents.map((student, index) => (
          <motion.div
            key={student.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            custom={index}
            transition={{ delay: index * 0.1 }}
            className="h-full"
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-md h-full flex flex-col border border-green-100 transform-gpu">
              <div className="p-2 text-center border-b border-green-50">
                {" "}
                {/* Reduced padding from p-4 to p-2 */}
                <h3 className="font-bold text-lg text-green-800">
                  {student.name}
                </h3>
              </div>

              <div className="flex-1 bg-gradient-to-b from-green-50 to-white p-2 flex items-center justify-center">
                {" "}
                {/* Reduced padding from p-4 to p-2 */}
                <div className="relative w-full h-36 flex items-center justify-center">
                  {" "}
                  {/* Reduced height from h-48 to h-36 */}
                  <img
                    src={student.imageSrc}
                    alt={`${student.name}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              <div className="p-2 bg-white">
                {" "}
                {/* Reduced padding from p-4 to p-2 */}
                <div className="mb-2">
                  {" "}
                  {/* Reduced margin from mb-3 to mb-2 */}
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Subject
                  </div>
                  <div className="font-medium text-gray-800">
                    {student.subject}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Score
                  </div>
                  <div className="font-bold text-green-600 text-lg">
                    {student.score}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <section
      className="py-16 lg:py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-400"></div>
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          ref={carouselRef}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-14"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center justify-center mb-2"
          >
            <div className="flex items-center justify-center bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-2 rounded-full shadow-sm mb-2">
              <FaTrophy className="text-amber-500 text-2xl mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold text-green-800 tracking-tight">
                Our Results
              </h2>
              <FaMedal className="text-amber-500 text-2xl ml-3" />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="w-24 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full mb-6"
          />

          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Celebrating the excellence of our students through dedicated
            education and rigorous academic training
          </motion.p>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaGraduationCap className="text-green-600 text-xl" />
            <h3 className="text-2xl font-bold text-green-800">
              Class 9th Achievements
            </h3>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-white px-5 py-3 rounded-lg shadow-sm border border-green-100"
            >
              <p className="text-sm text-green-500 font-medium">Top Scores</p>
              <p className="text-green-800 font-bold text-xl">90%+</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-white px-5 py-3 rounded-lg shadow-sm border border-green-100"
            >
              <p className="text-sm text-green-500 font-medium">Pass Rate</p>
              <p className="text-green-800 font-bold text-xl">100%</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-white px-5 py-3 rounded-lg shadow-sm border border-green-100"
            >
              <p className="text-sm text-green-500 font-medium">
                District Toppers
              </p>
              <p className="text-green-800 font-bold text-xl">6</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              className="bg-white px-5 py-3 rounded-lg shadow-sm border border-green-100"
            >
              <p className="text-sm text-green-500 font-medium">Distinction</p>
              <p className="text-green-800 font-bold text-xl">15</p>
            </motion.div>
          </div>
        </motion.div>

        <div
          className="relative"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          <div className="mx-auto overflow-hidden px-4 py-2">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full"
              >
                {renderSlideContent(currentSlide)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "#fff" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              prevSlide();
              pauseAutoplay();
            }}
            className="absolute top-1/2 -left-3 md:left-0 transform -translate-y-1/2 bg-white text-green-600 p-3 rounded-full shadow-lg z-10 transition-all focus:outline-none"
            aria-label="Previous slide"
          >
            <FaChevronLeft size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "#fff" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              nextSlide();
              pauseAutoplay();
            }}
            className="absolute top-1/2 -right-3 md:right-0 transform -translate-y-1/2 bg-white text-green-600 p-3 rounded-full shadow-lg z-10 transition-all focus:outline-none"
            aria-label="Next slide"
          >
            <FaChevronRight size={18} />
          </motion.button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-10 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                goToSlide(index);
                pauseAutoplay();
              }}
              className={`transition-all duration-300 rounded-full ${
                currentSlide === index
                  ? "bg-green-600 w-8 h-2"
                  : "bg-gray-300 w-2 h-2 hover:bg-green-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-12"
        >
          <div className="inline-block bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 rounded-xl shadow-sm">
            <p className="text-lg text-green-800">
              <span className="font-bold">Our students excel</span> in
              competitive exams and academic achievements
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ResultCarousel;
