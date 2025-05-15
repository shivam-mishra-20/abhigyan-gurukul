import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine,
  FaUsers,
  FaCrown,
  FaUserClock,
  FaUserGraduate,
  FaHandshake,
  FaArrowRight,
  FaGraduationCap,
  FaCalendarAlt,
  FaChalkboardTeacher,
} from "react-icons/fa";
import GoogleReviews from "../components/Page-Specific-Components/GoogleReviews";
import MobileTeachers from "../components/MobileTeachers";
import MobileResultCarousel from "../components/MobileResultCarousel";

import MobileVideoCarousel from "../components/MobileVideoCarousel";
import StudeentCarousel from "../components/StudentCarousel";
import EventCarousel from "../components/EventCarousel";

const MobileHome = () => {
  // Image paths
  const images = [
    "/Photo.png",
    "/Photo2.jpg",
    "/placeholder.png",
    "/ABHIGYAN_GURUKUL_logo.svg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate images every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [images.length]);

  const text = (
    <p className="text-gray-600 text-xl mt-5 flex-wrap">
      Experience teaching from{" "}
      <span className="font-bold text-[#F76060]">Amazing Teachers</span> who
      have mastered the art of
      <span className="font-bold text-[#F76060]">Teaching</span> Click on "
      <span className=" font-bold text-green-600">View All</span>" to look at
      all the
      <span className="font-bold text-[#F76060]"> Faculties -</span>
    </p>
  );

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Quick links data
  const quickLinks = [
    {
      icon: <FaGraduationCap className="text-lg" />,
      text: "Admissions",
      path: "/admissions",
    },
    {
      icon: <FaChalkboardTeacher className="text-lg" />,
      text: "Courses",
      path: "/courses",
    },
    {
      icon: <FaCalendarAlt className="text-lg" />,
      text: "Events",
      path: "/events",
    },
  ];

  return (
    <>
      <StudeentCarousel />
      {/* Enhanced Hero Section - Mobile Version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-green-50 via-white to-blue-50 pt-8 pb-12 overflow-hidden"
      >
        {/* Background elements */}
        <motion.div
          className="absolute top-5 right-5 w-40 h-40 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="absolute bottom-5 left-5 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
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

        <div className="px-4 text-center">
          <motion.h1
            {...fadeInUp}
            className="text-3xl font-bold text-gray-800 leading-tight"
          >
            Shaping <span className="text-green-600">Futures</span> Through{" "}
            <span className="text-green-600">Education</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base text-gray-600 mt-4"
          >
            At Abhigyan Gurukul, we blend ancient wisdom with modern teaching
            methods to nurture young minds towards academic excellence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="my-6 relative"
          >
            <img
              src="/Photo.png"
              alt="Students at Abhigyan Gurukul"
              className="rounded-lg shadow-lg mx-auto h-[200px] object-cover"
            />

            {/* Floating stat cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute left-2 top-5 bg-white p-2 rounded-lg shadow-md"
            >
              <div className="text-center">
                <span className="block text-lg font-bold text-green-600">
                  90%+
                </span>
                <span className="text-xs text-gray-500">Success Rate</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute bottom-2 right-2 bg-white p-2 rounded-lg shadow-md"
            >
              <div className="text-center">
                <span className="block text-lg font-bold text-blue-600">
                  500+
                </span>
                <span className="text-xs text-gray-500">Students</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col gap-3 items-center"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-[#0B7077] text-white px-7 py-3 rounded-lg text-lg font-medium shadow-md w-full max-w-xs flex items-center justify-center space-x-2"
              onClick={() => (window.location.href = "/enrollnow")}
            >
              <span>Apply Now</span>
              <FaArrowRight />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-[#6BC74C] text-white px-7 py-3 rounded-lg text-lg font-medium shadow-md w-full max-w-xs"
              onClick={() => {
                const featuresSection = document.getElementById("features");
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: "smooth" });
                } else {
                  window.scrollBy(0, 500); // Simple scroll if section not found
                }
              }}
            >
              Discover More
            </motion.button>
          </motion.div>

          {/* Quick Navigation Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6"
          >
            <h3 className="text-xs font-semibold text-gray-500 mb-3">
              QUICK LINKS
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={index}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100 z-0 cursor-pointer"
                  onClick={() => (window.location.href = link.path)}
                >
                  {link.icon}
                  <span className="text-sm text-gray-800">{link.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="bg-white px-4 py-6 border-1 border-gray-300 rounded-lg shadow-sm m-4"
      >
        {/* Heading */}
        <h1 className="text-2xl font-bold text-green-700 text-center">
          WELCOME TO ABHIGYAN GURUKUL
        </h1>

        {/* Description */}
        <p className="mt-4 text-gray-700 text-justify leading-relaxed ">
          Abhigyan Gurukul was created in the onset of covid in Vadodara,
          Gujarat as a one-to-one online classes with only 2 faculties. We had a
          very humble beginning as a platform to bridge the gap created by
          lockdowns and disturbed nature of education. We went beyond merely
          teaching. We actually started to develop ways to enhance students' IQ.
          We started changing lives And all of this was not sheer coincidence.
          It was the urge, Compelling desire, to always keep improving, that
          enabled our students to achieve new heights.
        </p>
      </motion.div>

      <MobileTeachers InfoText={text}></MobileTeachers>

      {/* Enhanced Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="flex flex-col items-center justify-center w-full py-10 relative px-4"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-green-700 mb-6 text-center"
        >
          Why Choose Us?
        </motion.h2>

        <div className="text-center space-y-8 border-1 border-gray-200 rounded-xl border-opacity-50 p-6 shadow-xl shadow-teal-50 w-full">
          {[
            {
              icon: (
                <FaUsers className="text-[#FF9E00] stroke- text-5xl mx-auto" />
              ),
              text: "Limited Batch Size (10-15 Students)",
            },
            {
              icon: (
                <FaChartLine className="text-[#FF9E00] stroke- text-5xl mx-auto" />
              ),
              text: "Proven Success Ratio",
            },
            {
              icon: (
                <FaCrown className="text-[#FF9E00] stroke- text-5xl mx-auto" />
              ),
              text: "Special Mentorship Program",
            },
            {
              icon: (
                <FaUserClock className="text-[#FF9E00] stroke- text-5xl mx-auto" />
              ),
              text: "360-Degree Support System",
            },
            {
              icon: (
                <FaUserGraduate className="text-[#FF9E00] stroke- text-5xl mx-auto" />
              ),
              text: "Young and Enthusiastic Mentors",
            },
            {
              icon: (
                <FaHandshake className="text-[#FF9E00] stroke- text-5xl mx-auto" />
              ),
              text: "Student Centric Approach",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              {feature.icon}
              <p className="text-lg font-semibold text-[#0D4627] mt-3">
                {feature.text}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Statistics Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-green-50 py-10 px-4"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          Our Achievements
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {[
            { number: "500+", label: "Students" },
            { number: "95%", label: "Success Rate" },
            { number: "25+", label: "Expert Teachers" },
            { number: "5+", label: "Years Experience" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-4 rounded-lg shadow text-center"
            >
              <h3 className="text-2xl font-bold text-green-600">
                {stat.number}
              </h3>
              <p className="text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Video Tutorials Section */}
      <MobileVideoCarousel />
      {/* Event Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-white py-10 px-4"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          Upcoming Events
        </h2>
        <EventCarousel />
      </motion.div>

      {/* Results Carousel */}
      <MobileResultCarousel />

      {/* Google Reviews */}
      <div className="my-8 px-4">
        <GoogleReviews />
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-green-600 to-green-500 py-10 px-4 text-white text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Ready to Join Us?</h2>
        <p className="mb-6">
          Take the first step towards academic excellence today
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="bg-white text-green-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          onClick={() => (window.location.href = "/enrollnow")}
        >
          Enroll Now
        </motion.button>
      </motion.div>
    </>
  );
};

export default MobileHome;
