/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  FaBook,
  FaCalculator,
  FaFlask,
  FaGlobe,
  FaLaptopCode,
  FaChalkboardTeacher,
  FaFileDownload,
  FaQuoteLeft,
  FaQuoteRight,
  FaStar,
  FaUserGraduate,
} from "react-icons/fa";
import { facultyMembers } from "../data/facultyData";

const Courses = () => {
  // Reference to check if component is mounted
  const isMounted = useRef(true);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }, // Reduced from 0.6 to 0.4
  };

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Reduced from 0.1 to 0.05 for faster appearance
        duration: 0.3, // Added specific duration
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 15 }, // Reduced y from 20 to 15
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3, // Explicit shorter duration
        ease: "easeOut", // Smoother easing function
      },
    },
  };

  // Course categories data
  const courseCategories = [
    {
      icon: <FaCalculator className="text-3xl text-purple-500" />,
      title: "Mathematics",
      description:
        "Comprehensive mathematics courses from basic arithmetic to advanced calculus, with special focus on competitive exam preparation.",
      courses: [
        "Basic Mathematics",
        "Advanced Mathematics",
        "JEE Mathematics",
        "Vedic Mathematics",
      ],
    },
    {
      icon: <FaFlask className="text-3xl text-red-500" />,
      title: "Science",
      description:
        "In-depth science courses covering physics, chemistry and biology with hands-on experiments and conceptual learning.",
      courses: ["Physics", "Chemistry", "Biology", "Integrated Science"],
    },
    {
      icon: <FaGlobe className="text-3xl text-blue-500" />,
      title: "Social Studies",
      description:
        "Engaging social studies courses that explore history, civics, geography and economics through interactive learning.",
      courses: ["History", "Geography", "Political Science", "Economics"],
    },
    {
      icon: <FaBook className="text-3xl text-yellow-500" />,
      title: "Languages",
      description:
        "Language courses focusing on Hindi, English and Sanskrit with emphasis on grammar, literature and communication skills.",
      courses: ["English Language & Literature", "Hindi", "Sanskrit"],
    },
    {
      icon: <FaLaptopCode className="text-3xl text-green-500" />,
      title: "Computer Science",
      description:
        "Modern computer science curriculum teaching programming fundamentals, web development and computational thinking.",
      courses: ["Programming Basics", "Web Development", "Data Structures"],
    },
    {
      icon: <FaChalkboardTeacher className="text-3xl text-indigo-500" />,
      title: "Olympiad Preparation",
      description:
        "Specialized courses for National and International Olympiads with advanced problem-solving techniques.",
      courses: ["Math Olympiad", "Science Olympiad", "Informatics Olympiad"],
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Ravi Kumar",
      role: "Class 12 Student",
      text: "The mathematics course completely changed my approach to problem-solving. The Vedic Mathematics techniques helped me solve complex problems quickly, which was crucial for my JEE preparation.",
      rating: 5,
    },
    {
      id: 2,
      name: "Ananya Shah",
      role: "Class 10 Student",
      text: "I was struggling with Physics concepts until I joined Abhigyan Gurukul. The practical demonstrations and conceptual clarity provided by the teachers helped me score 95% in my board exams.",
      rating: 5,
    },
    {
      id: 3,
      name: "Suresh Patel",
      role: "Parent",
      text: "My son has been attending the Olympiad preparation classes for two years now. The personalized attention and challenging problems have significantly improved his analytical thinking.",
      rating: 4,
    },
    {
      id: 4,
      name: "Meera Joshi",
      role: "Class 11 Student",
      text: "The chemistry course is exceptional! The way complex reactions are explained with visual aids and real-life examples makes learning enjoyable and effective.",
      rating: 5,
    },
  ];

  // Curriculum PDFs
  const curriculumPDFs = [
    {
      title: "Mathematics Curriculum 2023-24",
      size: "2.4 MB",
      class: "Classes 8-12",
      link: "#",
    },
    {
      title: "Science Curriculum 2023-24",
      size: "3.1 MB",
      class: "Classes 8-12",
      link: "#",
    },
    {
      title: "JEE Preparation Roadmap",
      size: "1.8 MB",
      class: "Classes 11-12",
      link: "#",
    },
    {
      title: "NEET Preparation Roadmap",
      size: "2.2 MB",
      class: "Classes 11-12",
      link: "#",
    },
    {
      title: "Olympiad Training Program",
      size: "1.5 MB",
      class: "All Classes",
      link: "#",
    },
    {
      title: "Computer Science Syllabus",
      size: "1.7 MB",
      class: "Classes 8-12",
      link: "#",
    },
  ];

  // Image error handler function
  const handleImageError = (e) => {
    console.log("Image failed to load, using fallback");
    e.target.onerror = null; // Prevent infinite fallback loop
    e.target.src = "/fallback-profile.png"; // Use a fallback image
    e.target.style.display = "none";
    e.target.parentNode.innerHTML =
      '<div class="flex items-center justify-center h-full w-full bg-gray-200"><FaUserGraduate class="text-6xl text-gray-400" /></div>';
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-green-200 via-white to-blue-100 text-blue-800 py-16 px-4 md:px-8 border-b-2 border-gray-200"
      >
        <div className="container mx-auto max-w-5xl">
          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-4"
            {...fadeInUp}
          >
            Our Academic Programs
          </motion.h1>
          <motion.p
            className="text-xl mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Discover our comprehensive curriculum that blends traditional
            knowledge with modern teaching methods for holistic academic growth.
          </motion.p>
        </div>
      </motion.section>

      {/* Course Categories Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }} // Already optimized
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Our Course Categories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer a wide range of courses designed to meet the diverse
              needs of students at different academic levels.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerAnimation}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "50px" }} // Added margin to start animation earlier
          >
            {courseCategories.map((category, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:border-green-300 hover:shadow-lg transition-all will-change-transform" // Added will-change-transform for optimization
                variants={itemAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }} // Faster hover animation
              >
                <div className="mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {category.title}
                </h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Popular Courses:
                  </h4>
                  <ul className="space-y-1">
                    {category.courses.map((course, idx) => (
                      <li key={idx} className="text-sm text-green-600">
                        • {course}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Faculty Section */}
      <section className="py-16 px-4 md:px-8 bg-green-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Meet Our Expert Faculty
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn from experienced educators who are passionate about teaching
              and committed to student success.
            </p>
          </motion.div>

          {/* Faculty Cards - No filtering, show all faculty */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerAnimation}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {facultyMembers.map((member) => (
              <motion.div
                key={member.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
                variants={itemAnimation}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Adjusted image container for better display */}
                <div className="h-52 sm:h-56 md:h-60 overflow-hidden flex items-center justify-center bg-gray-50">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-auto object-contain max-h-full"
                    onError={handleImageError}
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 text-gray-800">
                    {member.name}
                  </h3>
                  <p className="text-green-600 font-medium mb-2">
                    {member.subject} Specialist
                  </p>
                  <div className="flex items-center text-gray-600 mb-3">
                    <FaChalkboardTeacher className="mr-2 text-gray-400" />
                    <span>{member.experience} Experience</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Education:</span>{" "}
                      {member.education}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Specialty:</span>{" "}
                      {member.specialty}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Curriculum PDFs Section
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Curriculum Resources
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Download our curriculum guides and roadmaps to understand our
              comprehensive academic programs.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={containerAnimation}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {curriculumPDFs.map((pdf, index) => (
              <motion.a
                href={pdf.link}
                key={index}
                className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-colors"
                variants={itemAnimation}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-3 bg-red-100 rounded-lg mr-4">
                  <FaFileDownload className="text-xl text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{pdf.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-500">{pdf.class}</span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                      {pdf.size}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-gray-600">
              Need more information? Contact us for detailed course materials
              and sample lessons.
            </p>
          </motion.div>
        </div>
      </section> */}

      {/* Testimonials Section */}
      <section className="py-16 px-4 md:px-8 bg-green-50">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              What Our Students Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from our students about their learning experiences and
              achievements with us.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerAnimation}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-100 relative"
                variants={itemAnimation}
                whileHover={{ y: -5 }}
              >
                <FaQuoteLeft className="text-green-200 text-4xl absolute top-4 left-4 opacity-40" />
                <div className="mb-4 relative z-10">
                  <p className="text-gray-700 italic">"{testimonial.text}"</p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < testimonial.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>
                <FaQuoteRight className="text-green-200 text-4xl absolute bottom-4 right-4 opacity-40" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 bg-green-600 text-white text-center">
        <div className="container mx-auto max-w-3xl">
          <motion.h2
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ready to Begin Your Learning Journey?
          </motion.h2>
          <motion.p
            className="text-lg mb-8 opacity-90"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join Abhigyan Gurukul and experience the perfect blend of
            traditional and modern education.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-green-50 transition"
              onClick={() => (window.location.href = "/admissions")}
            >
              Apply Now
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Courses;
