import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine,
  FaUsers,
  FaCrown,
  FaUserClock,
  FaUserGraduate,
  FaHandshake,
} from "react-icons/fa";
import GoogleReviews from "../components/Page-Specific-Components/GoogleReviews";
import MobileTeachers from "../components/MobileTeachers";
import MobileResultCarousel from "../components/MobileResultCarousel";
import MobileVideoCarousel from "../components/MobileVideoCarousel"; // Import the new component
import HomePageMainCarousel from "../components/Page-Specific-Components/HomePageMainCarousel";

const ImageCarousel = () => {
  // Image paths (Ensure correct paths)
  const images = [
    "/Photo.png",
    "/Photo2.jpg",
    "/placeholder.png",
    "/ABHIGYAN_GURUKUL_logo.svg",
  ]; // Replace with actual paths

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate images every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [images.length]);

  const text = (
    <p className="text-gray-600 text-2xl mt-5 flex-wrap">
      Experience teaching from{" "}
      <span className="font-bold text-[#F76060]">Amazing Teachers</span> who
      have mastered the art of
      <span className="font-bold text-[#F76060]">Teaching</span> Click on "
      <span className=" font-bold text-green-600">View All</span>" to look at
      all the
      <span className="font-bold text-[#F76060]"> Faculties -</span>
    </p>
  );

  return (
    <>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="text-center py-6 px-4">
          <h1 className="text-xl font-bold text-gray-900">
            Mastering the Art of Studying with Abhigyan Gurukul
          </h1>
          <button
            className="mt-3 bg-[#0B7077] text-white px-7 py-2 rounded-lg text-lg font-medium shadow-md"
            onClick={() => (window.location.href = "/enrollnow")}
          >
            Enroll Now
          </button>
        </div>
      </div>

      <HomePageMainCarousel />

      <div className="bg-white px-4 py-6 border-1 border-gray-300 rounded-lg">
        {/* Heading */}
        <h1 className="text-2xl font-bold text-[#0B7077] text-center">
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

        <p className="mt-2 text-gray-700 text-justify leading-relaxed"></p>
      </div>

      <MobileTeachers InfoText={text}></MobileTeachers>

      <div className="flex flex-col items-center justify-center w-full py-10 relative">
        {/* Features List */}
        <div className="text-center space-y-10 border-1 border-gray-200 rounded-xl border-opacity-50 p-10 shadow-xl shadow-teal-50">
          <div>
            <FaUsers className="text-[#FF9E00] stroke- text-5xl mx-auto" />
            <p className="text-lg font-semibold text-[#0D4627]">
              Limited Batch Size (10-15 Students)
            </p>
          </div>

          <div>
            <FaChartLine className="text-[#FF9E00] stroke- text-5xl mx-auto" />
            <p className="text-lg font-semibold text-[#0D4627]">
              Proven Success Ratio
            </p>
          </div>

          <div>
            <FaCrown className="text-[#FF9E00] stroke- text-5xl mx-auto" />
            <p className="text-lg font-semibold text-[#0D4627]">
              Special Mentorship Program
            </p>
          </div>
          <div>
            <FaUserClock className="text-[#FF9E00] stroke- text-5xl mx-auto" />
            <p className="text-lg font-semibold text-[#0D4627]">
              360-Degree Support System
            </p>
          </div>
          <div>
            <FaUserGraduate className="text-[#FF9E00] stroke- text-5xl mx-auto" />
            <p className="text-lg font-semibold text-[#0D4627]">
              Young and Enthusiastic Mentors
            </p>
          </div>
          <div>
            <FaHandshake className="text-[#FF9E00] stroke- text-5xl mx-auto" />
            <p className="text-lg font-semibold text-[#0D4627]">
              Student Centric Approach
            </p>
          </div>
        </div>
      </div>

      {/* Video Tutorials Section - New Addition */}
      <MobileVideoCarousel />

      {/* Results Carousel */}
      <MobileResultCarousel />

      {/* Reviews Section */}
      {/* <GoogleReviews></GoogleReviews> */}
    </>
  );
};

export default ImageCarousel;
