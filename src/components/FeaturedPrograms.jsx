import React from "react";
import { motion } from "framer-motion";
import {
  FaChalkboardTeacher,
  FaCalculator,
  FaFlask,
  FaBook,
  FaArrowRight,
} from "react-icons/fa";

const FeaturedPrograms = () => {
  const programs = [
    {
      id: 1,
      title: "JEE Preparation",
      description:
        "Comprehensive coaching for JEE Main and Advanced with expert faculty and proven study materials.",
      icon: <FaCalculator className="text-4xl text-blue-500" />,
      color: "from-blue-50 to-blue-100 border-blue-200",
      iconBg: "bg-blue-100",
      link: "#",
    },
    {
      id: 2,
      title: "NEET Coaching",
      description:
        "Specialized program for medical aspirants with focus on Biology, Chemistry, and Physics concepts.",
      icon: <FaFlask className="text-4xl text-green-500" />,
      color: "from-green-50 to-green-100 border-green-200",
      iconBg: "bg-green-100",
      link: "#",
    },
    {
      id: 3,
      title: "Foundation Courses",
      description:
        "Early preparation courses for Classes 8-10, building strong fundamentals for competitive exams.",
      icon: <FaBook className="text-4xl text-yellow-500" />,
      color: "from-yellow-50 to-yellow-100 border-yellow-200",
      iconBg: "bg-yellow-100",
      link: "#",
    },
    {
      id: 4,
      title: "Olympiad Training",
      description:
        "Specialized coaching for Mathematics, Science and other International Olympiads.",
      icon: <FaChalkboardTeacher className="text-4xl text-purple-500" />,
      color: "from-purple-50 to-purple-100 border-purple-200",
      iconBg: "bg-purple-100",
      link: "#",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-16 px-4 border-2 border-gray-200 bg-white shadow-lg rounded-lg">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Our Featured Programs
          </h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our specialized academic programs designed to help students
            excel in their studies and competitive exams
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {programs.map((program) => (
            <motion.div
              key={program.id}
              variants={itemVariants}
              className={`bg-gradient-to-br ${program.color} border p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow`}
            >
              <div
                className={`${program.iconBg} w-16 h-16 rounded-full flex items-center justify-center mb-4`}
              >
                {program.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">
                {program.title}
              </h3>
              <p className="text-gray-600 mb-4">{program.description}</p>
              <motion.a
                href={program.link}
                whileHover={{ x: 5 }}
                className="inline-flex items-center text-green-600 font-medium"
                onClick={() => (window.location.href = "/courses")}
              >
                Learn More <FaArrowRight className="ml-2" />
              </motion.a>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
            onClick={() => (window.location.href = "courses")}
          >
            View All Programs
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedPrograms;
