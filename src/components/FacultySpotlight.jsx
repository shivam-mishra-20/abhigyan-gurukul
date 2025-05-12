import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaQuoteLeft,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
} from "react-icons/fa";

// Sample faculty data - can be moved to Firestore later
const facultyData = [
  {
    id: 1,
    name: "Abhigyan Gautam",
    position: "Mathematics Expert",
    image: "/AbgChndn.png", // Use existing image
    quote:
      "Learning is a journey that never ends. My goal is to ignite the curiosity of students and guide them to discover the wonders of physics.",
    expertise: ["Physics", "JEE Preparation", "Olympiad Training"],
    rating: 4.9,
  },
  {
    id: 2,
    name: "Chandan Mishra",
    position: "Physics Expert",
    image: "/AbgChndn.png", // Replace with actual image when available
    quote:
      "Mathematics is not about numbers, equations or algorithms. It's about understanding patterns and logical reasoning.",
    expertise: ["Mathematics", "Calculus", "Competitive Exams"],
    rating: 4.8,
  },
];

const FacultySpotlight = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextFaculty = () => {
    setCurrentIndex((prev) => (prev + 1) % facultyData.length);
  };

  const prevFaculty = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + facultyData.length) % facultyData.length
    );
  };

  return (
    <section
      className="py-16 bg-gradient-to-b from-gray-50 to-white"
      id="faculty-spotlight"
    >
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800">
            Our Outstanding Faculty
          </h2>
          <div className="w-24 h-1 bg-green-500 mx-auto mt-4"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Meet the dedicated educators who make Abhigyan Gurukul a center of
            excellence. Our teachers bring passion, expertise, and innovation to
            the classroom.
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              {/* Faculty Image */}
              <motion.div whileHover={{ scale: 1.03 }} className="relative">
                <div className="rounded-lg overflow-hidden shadow-xl">
                  <img
                    src={facultyData[currentIndex].image}
                    alt={facultyData[currentIndex].name}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-0 right-0 transform translate-y-1/4 bg-green-600 text-white p-4 rounded-lg shadow-lg"
                >
                  <div className="flex items-center">
                    <FaStar className="text-yellow-300 mr-1" />
                    <span className="font-bold">
                      {facultyData[currentIndex].rating}
                    </span>
                    <span className="text-xs ml-1">/5</span>
                  </div>
                  <div className="text-xs mt-1">Teacher Rating</div>
                </motion.div>
              </motion.div>

              {/* Faculty Info */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold text-gray-800">
                    {facultyData[currentIndex].name}
                  </h3>
                  <p className="text-green-600 font-medium">
                    {facultyData[currentIndex].position}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white p-6 rounded-lg shadow-lg relative"
                >
                  <FaQuoteLeft className="text-green-200 text-4xl absolute -top-3 -left-3" />
                  <p className="text-gray-600 italic">
                    "{facultyData[currentIndex].quote}"
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h4 className="font-semibold text-gray-700">
                    Areas of Expertise:
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {facultyData[currentIndex].expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex justify-between items-center pt-4"
                >
                  <div className="text-sm text-gray-500">
                    {currentIndex + 1} of {facultyData.length}
                  </div>

                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-gray-200 text-gray-800 p-2 rounded-full"
                      onClick={prevFaculty}
                      aria-label="Previous faculty"
                    >
                      <FaChevronLeft />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-green-600 text-white p-2 rounded-full"
                      onClick={nextFaculty}
                      aria-label="Next faculty"
                    >
                      <FaChevronRight />
                    </motion.button>
                  </div>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="bg-green-50 text-green-700 border border-green-200 px-5 py-2 rounded-lg flex items-center hover:bg-green-100 transition-colors"
                  onClick={() => (window.location.href = "/faculties")}
                >
                  View All Faculty Members
                  <FaChevronRight className="ml-2" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default FacultySpotlight;
