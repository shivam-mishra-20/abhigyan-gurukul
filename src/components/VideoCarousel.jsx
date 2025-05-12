import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { motion } from "framer-motion";
import {
  FaPlay,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaUser,
  FaTag,
} from "react-icons/fa";

const videoData = [
  {
    id: "1",
    title:
      "Basic Maths for Physics - Differentiation (Part 1) for Class 11 | JEE / NEET 2025",
    description:
      "Basic Maths for Physics - Differentiation (Part 1) for Class 11 | JEE / NEET 2025",
    duration: "41 mins",
    author: "Abhigyan Sir",
    price: "Free",
    youtubeId: "TvNB4fHYJs4",
    rating: "4.9",
    reviews: "238",
  },
  {
    id: "2",
    title:
      "REAL NUMBERS - Lecture 1 | Class 10th |  Number of Zeros in an expression ? ",
    description:
      "REAL NUMBERS - Lecture 1 | Class 10th |  Number of Zeros in an expression ? ",
    duration: "10:39 mins",
    author: "Abhigyan Sir",
    price: "Free",
    youtubeId: "oLwUa5tdxGQ",
    rating: "4.8",
    reviews: "156",
  },
  {
    id: "3",
    title: "Motion - Absolute or Relative? #2 | Chapter 8 | Class 9",
    description: "Is motion relative or absolute? Lets discuss in this video!",
    duration: "15 min",
    author: "Abhigyan Sir",
    price: "Free",
    youtubeId: "UlhjoJ8l6iU",
    rating: "4.7",
    reviews: "124",
  },
];

const VideoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: { perView: 3, spacing: 28 },
    breakpoints: {
      "(max-width: 1280px)": { slides: { perView: 2.5, spacing: 24 } },
      "(max-width: 1024px)": { slides: { perView: 2, spacing: 20 } },
      "(max-width: 768px)": { slides: { perView: 1.2, spacing: 16 } },
      "(max-width: 640px)": { slides: { perView: 1, spacing: 12 } },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8"
        >
          {/* Title with animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-bold text-green-700 mb-3">
              Watch Free Tutorials
            </h2>
            <div className="w-28 h-1.5 bg-gradient-to-r from-green-500 to-green-300 mx-auto rounded-full"></div>
            <p className="mt-5 text-gray-600 max-w-2xl mx-auto text-lg">
              Explore our collection of free educational videos to boost your
              learning journey
            </p>
          </motion.div>

          {/* Video Carousel */}
          <div className="relative px-8">
            <div ref={sliderRef} className="keen-slider pb-3">
              {videoData.map((video) => (
                <div key={video.id} className="keen-slider__slide px-1">
                  <motion.div
                    whileHover={{
                      y: -8,
                      boxShadow: "0 20px 30px rgba(0, 0, 0, 0.12)",
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="bg-white rounded-xl overflow-hidden shadow-md h-full border-2 border-gray-100 hover:border-green-200 transition-all duration-300"
                  >
                    <div className="relative group">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Play button overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <motion.a
                          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 text-white p-4 rounded-full hover:bg-green-700 transition-colors shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaPlay size={20} />
                        </motion.a>
                      </div>
                      {/* Duration badge */}
                      <div className="absolute bottom-3 left-3 bg-black bg-opacity-75 text-white text-xs px-3 py-1.5 rounded-full flex items-center backdrop-blur-sm">
                        <FaClock className="mr-1.5" /> {video.duration}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2.5 line-clamp-2 text-gray-800 leading-snug">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>

                      <div className="flex items-center justify-between mt-5">
                        <div className="flex items-center text-sm text-gray-500">
                          <FaUser className="mr-1.5 text-green-600" />
                          <span>{video.author}</span>
                        </div>
                        <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                          <FaTag className="mr-1.5 text-green-600" />
                          <span className="text-green-600 font-semibold">
                            {video.price}
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(Number(video.rating))
                                  ? "text-yellow-400"
                                  : "text-gray-200"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-yellow-500 ml-2 font-medium">
                          {video.rating}
                        </span>
                        <span className="text-gray-500 ml-1 text-xs">
                          ({video.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Navigation arrows */}
            {loaded && instanceRef.current && (
              <>
                <motion.button
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "#16a34a",
                    color: "#ffffff",
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white text-green-600 p-3 rounded-full shadow-lg z-10 focus:outline-none border border-gray-100 transition-all duration-200"
                  onClick={() => instanceRef.current?.prev()}
                >
                  <FaChevronLeft className="text-lg" />
                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "#16a34a",
                    color: "#ffffff",
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-green-600 p-3 rounded-full shadow-lg z-10 focus:outline-none border border-gray-100 transition-all duration-200"
                  onClick={() => instanceRef.current?.next()}
                >
                  <FaChevronRight className="text-lg" />
                </motion.button>
              </>
            )}
          </div>

          {/* Dots */}
          {loaded && instanceRef.current && (
            <div className="flex justify-center mt-10">
              {[
                ...Array(
                  instanceRef.current.track.details.slides.length
                ).keys(),
              ].map((idx) => (
                <button
                  key={idx}
                  onClick={() => instanceRef.current?.moveToIdx(idx)}
                  className={`mx-1.5 w-3 h-3 rounded-full focus:outline-none transition-all duration-300 ${
                    currentSlide === idx
                      ? "bg-green-600 w-6"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                ></button>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.a
              href="https://www.youtube.com/@abhigyangurukul"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-7 py-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-600 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Visit Our YouTube Channel
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </motion.a>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
};

export default VideoCarousel;
