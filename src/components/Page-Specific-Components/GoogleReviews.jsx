import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const reviews = [
  {
    name: "alok ray",
    reviews: "14 reviews · 2 photos",
    rating: 5,
    time: "8 months ago",
    text: "I recommend Abhigyan Gurukul! My son Ayush Ray has been attending their classes for the past six months, and we have seen remarkable improvements in his grades and confidence.",
  },
  {
    name: "NEEL BHORKAR",
    reviews: "4 reviews",
    rating: 5,
    time: "a year ago",
    text: "Best Institute for commerce 11th and 12th! Faculties are very supportive and work really hard to personally care for students.",
  },
  {
    name: "arijita dasgupta pal",
    reviews: "1 review",
    rating: 5,
    time: "a year ago",
    text: "Great place to study. Great faculties for Science: Chandan sir. Maths: Abhigyan sir. And Individual sessions by Nitesh sir.",
  },
];

const ReviewsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-xl mx-auto text-center p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-lg font-semibold text-gray-700">What People Say</h2>
      <h1 className="text-2xl font-bold text-[#0D4627] mt-2">
        Google Verified Reviews
      </h1>
      <hr className="w-1/4 mx-auto my-3 border-blue-800" />
      <h3 className="text-xl font-semibold">EXCELLENT</h3>
      <div className="text-yellow-500 text-3xl mt-2">{"⭐".repeat(5)}</div>
      <p className="text-gray-700 mt-2">
        Based on <span className="font-bold">250+</span> reviews
      </p>
      {/* <img src="/google-logo.png" alt="Google" className="w-24 mx-auto mt-2" /> */}

      <div className="bg-white p-4 rounded-lg shadow-md mt-4 text-left">
        <AnimatePresence>
          <motion.div
            key={currentIndex}
            className="flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              {/* <img
                src="/default-user.png"
                alt={reviews[currentIndex].name}
                className="w-10 h-10 rounded-full"
              /> */}
              <div>
                <p className="font-semibold">{reviews[currentIndex].name}</p>
                <p className="text-sm text-gray-500">
                  {reviews[currentIndex].time}
                </p>
              </div>
            </div>
            <div className="text-yellow-500 text-xl mt-2">
              {"⭐".repeat(reviews[currentIndex].rating)}
            </div>
            <p className="mt-2 text-gray-800">{reviews[currentIndex].text}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center mt-4 space-x-2">
          {reviews.map((_, index) => (
            <button
              key={index}
              className={`h-3 w-3 rounded-full ${
                index === currentIndex ? "bg-blue-500 scale-125" : "bg-gray-300"
              } transition-transform duration-300`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsCarousel;
