import React from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";

const features = [
  { icon: "👥", text: "Limited Batch Size (15 Students)" },
  { icon: "📈", text: "Proven Success Ratio" },
  { icon: "👑", text: "Special Mentorship Program" },
  { icon: "🤝", text: "Student Centric Approach" },
  { icon: "🕒", text: "360° Support System" },
  { icon: "🎓", text: "Young and Enthusiastic Mentors" },
];

export const MajorFeatures = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <>
      <hr className="mt-30 mb-20 border-t-1 border-black opacity-[18%] my-4" />

      <section className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 border-1 border-gray-200 rounded-2xl">
        {/* Animated Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[#317100] text-6xl font-semibold items-center justify-center w-fill text-center hidden:sm block"
        >
          Major Features
          <motion.img
            src="/Intro-Pattern.png"
            className="w-fit h-3 ml-[calc(100%/1.9)] justify-center rotate-1 hidden sm:block"
            alt="Abhigyan Gurukul Introduction pattern"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className={`grid ${
            isMobile ? "grid-cols-1" : "grid-cols-2"
          } gap-6 mt-8`}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.06, fontSize: 60 }}
              className="flex items-center bg-white p-4 rounded-lg border-1 border-gray-200 drop-shadow-sm"
            >
              <span className="text-3xl mr-4">{feature.icon}</span>
              <p className="text-lg font-medium text-gray-800">
                {feature.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
};
