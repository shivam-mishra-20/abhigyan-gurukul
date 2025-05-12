import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaGraduationCap,
  FaUsers,
  FaTrophy,
  FaChalkboardTeacher,
} from "react-icons/fa";

// Component for animated counter
const AnimatedCounter = ({ value, duration = 2000, className }) => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      let startTime;
      const animateCount = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsedTime = timestamp - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        setCount(Math.floor(progress * value));

        if (progress < 1) {
          requestAnimationFrame(animateCount);
        }
      };
      requestAnimationFrame(animateCount);
    }
  }, [inView, value, duration]);

  return (
    <motion.div ref={ref} animate={controls}>
      <span className={className}>{count}+</span>
    </motion.div>
  );
};

const StatisticsSection = () => {
  const stats = [
    {
      icon: <FaUsers className="text-3xl md:text-4xl text-blue-500" />,
      value: 500,
      label: "Students Enrolled",
      description: "Pursuing excellence in various courses",
    },
    {
      icon: <FaGraduationCap className="text-3xl md:text-4xl text-green-500" />,
      value: 95,
      label: "Success Rate",
      suffix: "%",
      description: "Students achieving their academic goals",
    },
    {
      icon: <FaTrophy className="text-3xl md:text-4xl text-yellow-500" />,
      value: 120,
      label: "Award Winners",
      description: "Students excelling in competitions",
    },
    {
      icon: (
        <FaChalkboardTeacher className="text-3xl md:text-4xl text-purple-500" />
      ),
      value: 25,
      label: "Experienced Teachers",
      description: "Dedicated to student success",
    },
  ];

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="py-16 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800">Our Achievements</h2>
          <div className="w-24 h-1 bg-green-500 mx-auto mt-4"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center"
              whileHover={{
                y: -5,
                transition: { duration: 0.2 },
              }}
            >
              <div className="flex justify-center mb-4">{stat.icon}</div>

              <div className="flex justify-center items-baseline">
                <AnimatedCounter
                  value={stat.value}
                  className="text-4xl font-bold text-gray-800"
                />
                <span className="text-2xl font-bold text-gray-800">
                  {stat.suffix}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-700 mt-2">
                {stat.label}
              </h3>
              <p className="text-gray-500 text-sm mt-2">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default StatisticsSection;
