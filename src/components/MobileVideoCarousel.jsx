import React, { useState, useEffect, useRef } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { motion } from "framer-motion";
import {
  FaPlay,
  FaClock,
  FaUser,
  FaTag,
  FaChevronRight,
  FaChevronLeft,
  FaPause,
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

const MobileVideoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef(null);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1, spacing: 10 },
    created() {
      setLoaded(true);
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  // Auto-scroll functionality
  useEffect(() => {
    if (!isPaused && instanceRef.current) {
      autoPlayRef.current = setInterval(() => {
        instanceRef.current?.next();
      }, 4000); // Change slide every 4 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPaused, instanceRef.current]);

  const handleThumbnailLoad = (videoId) => {
    setThumbnailsLoaded((prev) => ({
      ...prev,
      [videoId]: true,
    }));
  };

  // Pause auto-scroll on user interaction
  const pauseAutoPlay = () => {
    setIsPaused(true);
    // Resume after 10 seconds of inactivity
    setTimeout(() => setIsPaused(false), 10000);
  };

  return (
    <section className="py-6 bg-gradient-to-b from-white to-gray-50">
      <div className="px-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-5"
        >
          <h2 className="text-xl font-bold text-green-700 mb-1.5">
            Watch Free Tutorials
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-green-500 to-green-300 mx-auto rounded-full"></div>
          <p className="mt-2 text-gray-600 text-xs px-2">
            Explore our educational videos
          </p>
        </motion.div>

        <div className="relative">
          <div ref={sliderRef} className="keen-slider" onClick={pauseAutoPlay}>
            {videoData.map((video) => (
              <div key={video.id} className="keen-slider__slide">
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-lg overflow-hidden shadow-md mx-1"
                >
                  <div className="relative">
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          thumbnailsLoaded[video.youtubeId]
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                        onLoad={() => handleThumbnailLoad(video.youtubeId)}
                        loading="eager"
                      />
                      {!thumbnailsLoaded[video.youtubeId] && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                          <svg
                            className="w-10 h-10 text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <a
                          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600/90 text-white p-2.5 rounded-full hover:bg-green-700/90 transition-colors backdrop-blur-sm"
                        >
                          <FaPlay size={14} />
                        </a>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                        <FaClock className="mr-1" size={8} /> {video.duration}
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="font-bold text-sm mb-1 line-clamp-2 text-gray-800 min-h-[2.5rem]">
                      {video.title}
                    </h3>

                    <div className="flex items-center justify-between mt-1.5 text-xs">
                      <div className="flex items-center text-gray-500">
                        <FaUser className="mr-1 text-green-600" size={10} />
                        <span>{video.author}</span>
                      </div>
                      <div className="flex items-center">
                        <FaTag className="mr-1 text-green-600" size={10} />
                        <span className="text-green-600 font-bold">
                          {video.price}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center mt-2 pt-1.5 border-t border-gray-100">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-2.5 h-2.5 ${
                              i < Math.floor(Number(video.rating))
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-yellow-500 ml-1 text-xs font-medium">
                        {video.rating}
                      </span>
                      <span className="text-gray-500 ml-1 text-xs">
                        ({video.reviews})
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {loaded && instanceRef.current && (
            <>
              <button
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-green-600 p-1.5 rounded-full shadow-sm z-10 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  instanceRef.current?.prev();
                  pauseAutoPlay();
                }}
                aria-label="Previous video"
              >
                <FaChevronLeft size={12} />
              </button>

              <button
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-green-600 p-1.5 rounded-full shadow-sm z-10 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  instanceRef.current?.next();
                  pauseAutoPlay();
                }}
                aria-label="Next video"
              >
                <FaChevronRight size={12} />
              </button>

              {/* Play/Pause button for auto-scroll */}
              <button
                className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm text-green-600 p-1.5 rounded-full shadow-sm z-10 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(!isPaused);
                }}
                aria-label={
                  isPaused ? "Resume auto-scroll" : "Pause auto-scroll"
                }
              >
                {isPaused ? <FaPlay size={10} /> : <FaPause size={10} />}
              </button>
            </>
          )}
        </div>

        {loaded && instanceRef.current && (
          <div className="flex justify-center mt-3 gap-1.5">
            {[
              ...Array(instanceRef.current.track.details.slides.length).keys(),
            ].map((idx) => (
              <button
                key={idx}
                onClick={() => {
                  instanceRef.current?.moveToIdx(idx);
                  pauseAutoPlay();
                }}
                className={`w-1.5 h-1.5 rounded-full focus:outline-none transition-all duration-200 ${
                  currentSlide === idx
                    ? "bg-green-600 scale-125"
                    : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        )}

        <motion.div
          className="text-center mt-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <a
            href="https://www.youtube.com/@abhigyangurukul"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3.5 py-1.5 bg-green-600 text-white text-xs font-medium rounded-full shadow-sm hover:bg-green-700 active:scale-95 transition-all"
          >
            Visit Our Channel
            <svg
              className="w-3 h-3 ml-1"
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
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default MobileVideoCarousel;
