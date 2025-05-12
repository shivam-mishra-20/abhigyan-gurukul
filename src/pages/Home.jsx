import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "../App.css";
import EventCarousel from "../components/EventCarousel"; // Fixed: Import as default export
import { MajorFeatures } from "../components/MajorFeatures";
import ResultCarousel from "../components/ResultCarousel";
import ReviewSlider from "../components/Reviews";

// Enhanced components

import FacultySpotlight from "../components/FacultySpotlight";

import ChatButton from "../components/ChatButton";

import FeaturedPrograms from "../components/FeaturedPrograms";

import VideoCarousel from "../components/VideoCarousel";
import HeroSection from "../components/HeroSection";
import StatisticsSection from "../components/StatisticsSection";

import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaCalendarAlt,
} from "react-icons/fa";
import HomePageMainCarousel from "../components/Page-Specific-Components/HomePageMainCarousel";
import MiniLeaderboardCard from "../components/MiniLeaderboardCard";
//       </h3>

const Home = () => {
  // Intersection Observer for animations
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const text1 = (
    <motion.p
      variants={textVariants}
      className="text-gray-700 text-xl md:text-2xl lg:text-3xl flex-wrap text-center"
    >
      At <span className="font-bold text-green-600">Abhigyan Gurukul</span>, we
      blend the wisdom of ancient traditions with
      <span className="font-bold text-green-600"> modern education</span> to
      nurture young minds in a way that fosters
      <span className="font-bold text-green-600"> intellectual</span>,
      <span className="font-bold text-green-600"> emotional</span>, and
      <span className="font-bold text-green-600"> spiritual growth</span>.
    </motion.p>
  );

  return (
    <>
      {/*Hero Section with 3D elements */}
      <HeroSection />
      {/* Animated Banner */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Banner />
      </motion.div> */}
      {/* Introduction Section with Animation */}
      <motion.section
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
        className="max-w-6xl mx-auto py-16 px-4 sm:px-6"
      >
        <motion.div variants={textVariants} className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-700">
            Our Educational Philosophy
          </h2>
          <div className="w-24 h-1 bg-green-500 mx-auto mb-8 rounded-full"></div>
          {text1}
        </motion.div>
      </motion.section>
      {/*Statistics with counters */}
      <StatisticsSection />
      {/* Faculty Spotlight with improved design */}
      <FacultySpotlight />
      {/* Featured Programs */}
      <FeaturedPrograms />
      {/* Major Features */}
      <div id="features">
        <MajorFeatures />
      </div>
      {/* Events - Using EventCarousel component */}
      <div id="events">
        <EventCarousel maxEvents={6} />
      </div>
      {/*Video Carousel */}
      <VideoCarousel />
      {/* Results Carousel */}
      <ResultCarousel />
      {/* reviews */}
      <ReviewSlider />
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
      {/* Floating Chat Button */}
      <ChatButton />
    </>
  );
};

export default Home;
