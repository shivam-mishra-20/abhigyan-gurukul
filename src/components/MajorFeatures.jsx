import React from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import { FaUserFriends, FaChartLine, FaCrown, FaHandshake, FaClock, FaGraduationCap } from "react-icons/fa";

const features = [
  { 
    icon: <FaUserFriends className="text-green-600" />, 
    text: "Limited Batch Size (15 Students)",
    description: "Personalized attention for every student"
  },
  { 
    icon: <FaChartLine className="text-blue-600" />, 
    text: "Proven Success Ratio",
    description: "Track record of excellent results" 
  },
  { 
    icon: <FaCrown className="text-yellow-500" />, 
    text: "Special Mentorship Program",
    description: "One-on-one guidance for academic excellence" 
  },
  { 
    icon: <FaHandshake className="text-purple-600" />, 
    text: "Student Centric Approach",
    description: "Customized learning paths for individual needs" 
  },
  { 
    icon: <FaClock className="text-red-500" />, 
    text: "360° Support System",
    description: "Round-the-clock assistance for all concerns" 
  },
  { 
    icon: <FaGraduationCap className="text-indigo-600" />, 
    text: "Young and Enthusiastic Mentors",
    description: "Relatable teachers who connect with students" 
  },
];

export const MajorFeatures = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <div className="relative py-16 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-10 left-0 w-40 h-40 bg-green-100 rounded-full opacity-30 -z-10 blur-2xl"></div>
        <div className="absolute bottom-10 right-0 w-60 h-60 bg-blue-100 rounded-full opacity-30 -z-10 blur-3xl"></div>
      
        <hr className="w-1/2 mx-auto border-t-2 border-gray-200 mb-12" />

        <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Animated Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-green-700 inline-flex items-center justify-center">
              Major Features
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="ml-3 text-yellow-500 text-3xl"
              >
                ✨
              </motion.div>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto mt-4 rounded-full"></div>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Discover what makes our teaching approach special and effective
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid ${
              isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
            } gap-6 mt-8`}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                className="flex flex-col bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 hover:border-green-200"
              >
                <div className="flex items-center mb-3">
                  <div className="p-3 rounded-full bg-gray-50 mr-4">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {feature.text}
                  </h3>
                </div>
                <p className="text-gray-600 ml-16 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Call to action */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-12 text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Learn More About Our Approach
            </motion.button>
          </motion.div>
        </section>
      </div>
    </>
  );
};
