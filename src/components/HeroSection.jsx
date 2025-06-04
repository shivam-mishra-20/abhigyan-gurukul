import React from "react";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaGraduationCap,
  FaCalendarAlt,
  FaChalkboardTeacher,
} from "react-icons/fa";

const HeroSection = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
  };

  const fadeIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
  };

  // Quick links data
  const quickLinks = [
    {
      icon: <FaGraduationCap className="text-lg" />,
      text: "Admissions",
      path: "/admissions",
    },
    // {
    //   icon: <FaChalkboardTeacher className="text-lg" />,
    //   text: "Courses",
    //   path: "/courses",
    // },
    // {
    //   icon: <FaCalendarAlt className="text-lg" />,
    //   text: "Events",
    //   path: "/events",
    // },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative bg-gradient-to-br from-green-100 via-white to-blue-100 py-16 px-4 overflow-hidden border-b-2 border-gray-200"
    >
      {/* Background elements */}
      <motion.div
        className="absolute top-10 right-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.div
        className="absolute bottom-10 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1,
        }}
      />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Text Content */}
        <div className="space-y-8">
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800"
          >
            Shaping <span className="text-green-600">Futures</span> Through{" "}
            <span className="text-green-600">Education</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 max-w-lg"
          >
            At Abhigyan Gurukul, we blend ancient wisdom with modern teaching
            methods to nurture young minds towards academic excellence and
            personal growth.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#0B8077" }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#0B7077] text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-lg z-0"
              onClick={() => (window.location.href = "/enrollnow")}
            >
              <span>Apply Now</span>
              <FaArrowRight />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#5BA348" }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#6BC74C] text-white px-6 py-3 rounded-lg font-medium shadow-lg z-0"
              onClick={() => {
                const featuresSection = document.getElementById("features");
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Discover More
            </motion.button>
          </motion.div>

          {/* Quick Navigation Links */}
          <motion.div variants={fadeIn} className="pt-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">
              QUICK LINKS
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 cursor-pointer z-0"
                  onClick={() => (window.location.href = link.path)}
                >
                  {link.icon}
                  <span className="text-gray-800">{link.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Image/Illustration */}
        <motion.div variants={fadeIn} className="relative flex justify-center">
          <img
            src="/Ab-Banner-02.jpg"
            alt="Students at Abhigyan Gurukul"
            className="rounded-lg shadow-2xl max-w-full object-cover h-[400px]"
          />

          {/* Floating stats cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute -left-10 top-20 bg-white p-3 rounded-lg shadow-lg"
          >
            <div className="text-center">
              <span className="block text-2xl font-bold text-green-600">
                90%+
              </span>
              <span className="text-xs text-gray-500">Success Rate</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute -bottom-5 -right-5 bg-white p-3 rounded-lg shadow-lg"
          >
            <div className="text-center">
              <span className="block text-2xl font-bold text-blue-600">
                500+
              </span>
              <span className="text-xs text-gray-500">Happy Students</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
