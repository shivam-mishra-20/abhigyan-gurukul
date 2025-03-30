import React from "react";
import { motion } from "framer-motion";

const MobileTeachers = (prop) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
      className="flex flex-col items-center text-center p-4"
    >
      {/* Image */}
      <motion.img
        className="rounded-lg w-full max-w-xs"
        src="/AbgChndn.png" // Placeholder image
        alt="Abhigyan Gurukul Masters of Teaching"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.7 }}
      />

      {/* Text */}
      <h2 className="text-3xl font-semibold text-gray-900 mt-4">
        The Masters Of Teaching
      </h2>

      <p className="text-gray-600 mt-2 px-4">{prop.InfoText}</p>

      {/* Button */}
      <a href="#">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 border border-green-500 drop-shadow-md text-white px-4 py-2 rounded-lg font-semibold bg-green-600"
        >
          View All
        </motion.button>
      </a>
    </motion.div>
  );
};

export default MobileTeachers;
