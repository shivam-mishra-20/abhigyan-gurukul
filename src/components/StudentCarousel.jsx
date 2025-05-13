// StudentCarousel.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const students = [
  {
    name: "Shreya",
    science: 99,
    math: 98,
    image: "/images/shreya.png",
  },
  {
    name: "Priyani",
    science: 99,
    math: 97,
    image: "/images/priyani.png",
  },
  {
    name: "Dhyani",
    science: 88,
    math: 84,
    image: "/images/dhyani.png",
  },
  // Add more as needed
];

const StudentCarousel = () => {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(timer);
  }, [index]);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % students.length);
  };

  // Get visible students - always show three regardless of device
  const getVisibleStudents = () => {
    return [
      students[index % students.length],
      students[(index + 1) % students.length],
      students[(index + 2) % students.length],
    ];
  };

  // Mobile view renderer - now showing three cards
  const renderMobileView = () => {
    return (
      <div className="flex justify-center items-center gap-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {getVisibleStudents().map((student, i) => (
            <motion.div
              key={`student-mobile-${index + i}`}
              initial={{ opacity: 0, x: 40, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: i === 1 ? 1 : 0.9 }}
              exit={{ opacity: 0, x: -40, scale: 0.8 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`bg-white rounded-lg p-1 shadow-md text-center
                ${i === 1 ? "w-[110px]" : "w-[100px]"}`}
              style={{ 
                border: i === 1 ? "2px solid #22c55e" : "1px solid #e0e0e0",
                transform: `translateY(${i === 1 ? "-3px" : "0px"})`,
              }}
            >
              <div className="bg-white rounded-md overflow-hidden">
                <img
                  src={student.image}
                  alt={student.name}
                  className="w-full h-20 object-cover"
                />
              </div>
              <h3 className={`text-green-600 font-semibold text-xs mt-1`}>
                {student.name}
              </h3>
              <div className="mt-0.5">
                <p className="text-green-600 text-xs">
                  Sci <span className="text-blue-600">{student.science}</span>
                </p>
                <p className="text-orange-600 text-xs">
                  Math <span className="text-blue-600">{student.math}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Navigation dots for mobile */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 mt-1">
          {students.map((_, i) => (
            <span
              key={`dot-${i}`}
              className={`inline-block h-1 w-1 rounded-full ${
                i === index % students.length ? "bg-green-600" : "bg-gray-300"
              }`}
            ></span>
          ))}
        </div>
      </div>
    );
  };

  // Desktop view renderer
  const renderDesktopView = () => {
    return (
      <div className="flex justify-center items-center gap-3 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {getVisibleStudents().map((student, i) => (
            <motion.div
              key={`student-${index + i}`}
              initial={{ opacity: 0, x: 60, scale: 0.8 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: i === 1 ? 1.05 : 0.9,
                zIndex: i === 1 ? 10 : 1,
              }}
              exit={{ opacity: 0, x: -60, scale: 0.8 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`bg-white rounded-lg p-2 shadow-md text-center
                ${i === 1 ? "z-10 w-[190px]" : "z-0 w-[160px]"}`}
              style={{
                border: i === 1 ? "2px solid #22c55e" : "1px solid #e0e0e0",
                transform: `translateY(${i === 1 ? "-5px" : "0px"})`,
              }}
            >
              <div className="bg-white rounded-md overflow-hidden">
                <img
                  src={student.image}
                  alt={student.name}
                  className={`w-full object-cover ${i === 1 ? "h-34" : "h-30"}`}
                />
              </div>
              <h3
                className={`text-green-600 font-semibold mt-1 ${
                  i === 1 ? "text-base" : "text-sm"
                }`}
              >
                {student.name}
              </h3>
              <div className="mt-0.5">
                <p
                  className={`text-green-600 ${
                    i === 1 ? "text-xs" : "text-xs"
                  }`}
                >
                  Science -{" "}
                  <span className="text-blue-600">{student.science}/100</span>
                </p>
                <p
                  className={`text-orange-600 ${
                    i === 1 ? "text-xs" : "text-xs"
                  }`}
                >
                  Math -{" "}
                  <span className="text-blue-600">{student.math}/100</span>
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="bg-pink-50 py-4 px-3 md:px-6 rounded-xl shadow-lg w-full max-w-5xl mx-auto relative">
      {/* Batch size indicator */}
      <div className="absolute top-2 right-4 text-pink-500 font-medium text-sm">
        Batch Size - {index + 1}/{students.length}
      </div>

      <div className="flex items-center mb-4">
        <div className="text-left">
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "#D35400" }}
          >
            GSEB
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-blue-900">
            Class 10
          </h3>
        </div>
      </div>

      {/* Conditional rendering based on device type */}
      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* Hidden next button (using auto-slide) */}
      <div className="hidden">
        <button onClick={nextSlide}>Next</button>
      </div>
    </div>
  );
};

export default StudentCarousel;
