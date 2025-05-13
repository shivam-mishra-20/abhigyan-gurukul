// StudentCarousel.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const students = [
  {
    name: "Shreya",
    science: 99,
    math: 98,
    image: "/Shreya.png",
  },
  {
    name: "Priyani",
    science: 99,
    math: 97,
    image: "/Priyani Rana.png",
  },
  {
    name: "Dhyani",
    science: 88,
    math: 84,
    image: "/Dhyani.png",
  },
  {
    name: "Prarthna",
    science: 68,
    math: 68,
    image: "/Prathna.png",
  },
  {
    name: "Prajakta",
    science: 68,
    math: 69,
    image: "/Prajakta.png",
  },
  {
    name: "Rishit",
    science: 84,
    math: 68,
    image: "/Rishit-cropped.png",
  },
  {
    name: "Naman",
    science: 62,
    math: 65,
    image: "/Naman.png",
  },
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

  // Get visible students - show four in desktop, three in mobile
  const getVisibleStudents = () => {
    // Use modulo operations to cycle through all 7 students
    if (isMobile) {
      return [
        students[index % students.length],
        students[(index + 1) % students.length],
        students[(index + 2) % students.length],
      ];
    } else {
      return [
        students[index % students.length],
        students[(index + 1) % students.length],
        students[(index + 2) % students.length],
        students[(index + 3) % students.length],
      ];
    }
  };

  // Mobile view renderer with bigger cards
  const renderMobileView = () => {
    return (
      <div className="flex justify-center items-center gap-2 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {getVisibleStudents().map((student, i) => (
            <motion.div
              key={`student-mobile-${index + i}`}
              initial={{ opacity: 0, x: 40, scale: 0.8 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: i === 1 ? 1 : 0.9,
                zIndex: i === 1 ? 2 : 1,
              }}
              exit={{ opacity: 0, x: -40, scale: 0.8 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={`bg-white rounded-lg p-2 shadow-md text-center ${
                i === 1 ? "w-[140px]" : "w-[120px]"
              }`}
              style={{
                border: i === 1 ? "1px solid #22c55e" : "1px solid #e0e0e0",
                boxShadow: i === 1 ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "",
              }}
            >
              <div className="bg-white rounded-md overflow-hidden">
                <img
                  src={student.image}
                  alt={student.name}
                  className={`w-full object-cover ${i === 1 ? "h-28" : "h-24"}`}
                />
              </div>
              <h3
                className={`text-green-600 font-semibold ${
                  i === 1 ? "text-sm" : "text-xs"
                } mt-1`}
              >
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
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 mt-1">
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

  // Desktop view renderer - now showing four cards with two center ones enlarged
  const renderDesktopView = () => {
    return (
      <div className="flex justify-center items-center gap-4 overflow-hidden py-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {getVisibleStudents().map((student, i) => {
            // Determine if this is a center card (position 1 or 2)
            const isCenter = i === 1 || i === 2;

            return (
              <motion.div
                key={`student-${index + i}`}
                initial={{ opacity: 0, x: 60, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: isCenter ? 1.03 : 0.95,
                  zIndex: isCenter ? 2 : 1,
                }}
                exit={{ opacity: 0, x: -60, scale: 0.8 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`bg-white rounded-lg p-3 shadow-md text-center ${
                  isCenter ? "w-[220px]" : "w-[180px]"
                }`}
                style={{
                  border: isCenter ? "2px solid #22c55e" : "1px solid #e0e0e0",
                  boxShadow: isCenter
                    ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                    : "",
                }}
              >
                <div className="bg-white rounded-md overflow-hidden">
                  <img
                    src={student.image}
                    alt={student.name}
                    className={`w-full object-cover ${
                      isCenter ? "h-44" : "h-40"
                    }`}
                  />
                </div>
                <h3 className="text-green-600 font-semibold mt-2 text-base">
                  {student.name}
                </h3>
                <div className="mt-1">
                  <p className="text-green-600 text-xs">
                    Science -{" "}
                    <span className="text-blue-600">{student.science}/100</span>
                  </p>
                  <p className="text-orange-600 text-xs">
                    Math -{" "}
                    <span className="text-blue-600">{student.math}/100</span>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div
      className="py-4 px-3 md:px-6 rounded-xl shadow-lg w-full mx-auto relative bg-gradient-to-br from-pink-50 to-blue-50"
      style={{ maxWidth: "100%", minHeight: "380px" }}
    >
      {/* Batch size indicator */}
      <div className="absolute top-3 right-5 bg-white px-3 py-1 rounded-full text-pink-600 font-medium text-sm shadow-sm">
        Batch Size
      </div>

      <div className="flex justify-center items-center mb-6 pt-2">
        <div className="text-center">
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
