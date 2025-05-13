import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  FaTrophy,
  FaMedal,
  FaTimes,
  FaGripLines,
  FaCrown,
} from "react-icons/fa";
import { GiPodium, GiRank3, GiLaurelCrown } from "react-icons/gi";
import { IoRibbon } from "react-icons/io5";

const FloatingLeaderboardButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState("Lakshya");
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragConstraints, setDragConstraints] = useState({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });
  const containerRef = useRef(null);

  // Update drag constraints when window resizes
  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current) {
        const { innerWidth, innerHeight } = window;
        setDragConstraints({
          top: -innerHeight + 100,
          left: -innerWidth + 100,
          right: innerWidth - 100,
          bottom: innerHeight - 100,
        });
      }
    };

    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, []);

  // Pre-fetch data when component mounts
  useEffect(() => {
    fetchTopStudents(selectedClass, selectedBatch);
  }, []);

  // Fetch data when selections change
  useEffect(() => {
    if (isOpen) {
      fetchTopStudents(selectedClass, selectedBatch);
    }
  }, [selectedBatch, selectedClass]);

  const fetchTopStudents = async (classFilter, batchFilter) => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "ActualStudentResults"));
      const filtered = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.class === classFilter && data.batch === batchFilter) {
          const results = data.results || [];
          const totalMarks = results.reduce(
            (sum, r) => sum + parseFloat(r.marks || "0"),
            0
          );
          const totalOutOf = results.reduce(
            (sum, r) => sum + parseFloat(r.outOf || "0"),
            0
          );
          const percentage =
            totalOutOf > 0 ? (totalMarks / totalOutOf) * 100 : 0;

          filtered.push({
            name: data.name,
            percentage: percentage.toFixed(2),
            totalMarks,
            totalOutOf,
          });
        }
      });

      filtered.sort((a, b) => b.percentage - a.percentage);
      setTopStudents(filtered.slice(0, 5));
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePodium = () => {
    setIsOpen(!isOpen);
  };

  // Optimized animation variants
  const buttonVariants = {
    rest: { scale: 1, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" },
    hover: {
      scale: 1.1,
      rotate: 5,
      boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  };

  const podiumVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const studentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        delay: custom * 0.05,
      },
    }),
  };

  const listItemVariants = {
    hidden: { opacity: 0 },
    visible: (custom) => ({
      opacity: 1,
      transition: {
        duration: 0.2,
        delay: 0.1 + custom * 0.03,
      },
    }),
    hover: {
      x: 3,
      backgroundColor: "rgba(249, 250, 251, 1)",
      transition: { duration: 0.2 },
    },
  };

  const medalColors = {
    0: {
      bg: "linear-gradient(135deg, #FFD700 0%, #FFC800 100%)",
      border: "#FFB300",
      text: "#8B6914",
      podium: "linear-gradient(to top, #FFD700, #FFEA80)",
    },
    1: {
      bg: "linear-gradient(135deg, #C0C0C0 0%, #D8D8D8 100%)",
      border: "#A9A9A9",
      text: "#5F5F5F",
      podium: "linear-gradient(to top, #C0C0C0, #E8E8E8)",
    },
    2: {
      bg: "linear-gradient(135deg, #CD7F32 0%, #E0A868 100%)",
      border: "#A9683C",
      text: "#7D4E24",
      podium: "linear-gradient(to top, #CD7F32, #E9C097)",
    },
  };

  const renderMedalIcon = (index) => {
    if (index === 0) return <FaCrown className="text-yellow-500" />;
    if (index === 1) return <IoRibbon className="text-gray-400" />;
    if (index === 2) return <GiRank3 className="text-amber-700" />;
    return `${index + 1}`;
  };

  // Available classes and batches
  const availableClasses = [
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
  ];
  const availableBatches = ["Aadharshila", "Lakshya", "Basic"];

  return (
    <div ref={containerRef}>
      {/* Floating Button */}
      <motion.button
        drag
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={dragConstraints}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(e, info) => {
          setTimeout(() => setIsDragging(false), 50);
          setPosition({
            x: position.x + info.offset.x,
            y: position.y + info.offset.y,
          });
        }}
        onClick={() => !isDragging && togglePodium()}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        className="fixed z-50 bottom-10 right-10 bg-gradient-to-br from-indigo-600 via-blue-500 to-blue-600 text-white p-4 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          width: "65px",
          height: "65px",
          filter: "drop-shadow(0 4px 8px rgba(59, 130, 246, 0.5))",
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        <GiPodium className="text-2xl" />
        <motion.span
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
          animate={{
            scale: [1, 1.2, 1],
            transition: {
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5,
            },
          }}
        >
          3
        </motion.span>
      </motion.button>

      {/* Enhanced Podium Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={podiumVariants}
            drag
            dragConstraints={dragConstraints}
            dragElastic={0.05}
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(e, info) => {
              setTimeout(() => setIsDragging(false), 50);
              setPosition({
                x: position.x + info.offset.x,
                y: position.y + info.offset.y,
              });
            }}
            className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 cursor-grab active:cursor-grabbing"
            style={{
              width: "360px",
              maxWidth: "90vw",
              bottom: "100px",
              right: "20px",
              maxHeight: "85vh",
              overflow: "hidden",
              backgroundImage: "linear-gradient(to bottom, #fff, #f9fafb)",
              boxShadow:
                "0 10px 25px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1)",
              transform: `translate(${position.x}px, ${position.y}px)`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center ">
                <FaTrophy className="text-amber-500 text-xl mr-2" />
                <h3 className="font-bold text-gray-800 text-lg bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text">
                  Leaderboard
                </h3>
                <motion.span
                  className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium"
                  animate={{
                    y: [0, -2, 0],
                    transition: {
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 2,
                    },
                  }}
                >
                  LIVE
                </motion.span>
              </div>
              <div className="flex items-center">
                {/* <FaGripLines className="text-gray-400 mr-3" /> */}
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes />
                </motion.button>
              </div>
            </div>

            <div
              className="overflow-auto p-5"
              style={{ maxHeight: "calc(85vh - 60px)" }}
            >
              {/* Filter controls */}
              <motion.div
                className="flex space-x-2 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex-1 relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full p-2.5 pl-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none"
                  >
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      width="12"
                      height="6"
                      viewBox="0 0 12 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L6 5L11 1"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full p-2.5 pl-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none"
                  >
                    {availableBatches.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      width="12"
                      height="6"
                      viewBox="0 0 12 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1L6 5L11 1"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>

              {loading ? (
                <div className="py-8 flex justify-center items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : topStudents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-gray-500"
                >
                  <div className="w-20 h-20 mx-auto mb-4 opacity-30">
                    <GiPodium size={80} />
                  </div>
                  <p>No data available for this selection</p>
                </motion.div>
              ) : (
                <>
                  {/* Podium UI - Simplified for faster performance */}
                  {topStudents.length >= 3 && (
                    <motion.div
                      className="mb-8 pt-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-end justify-center h-[200px] relative">
                        {/* Second Place */}
                        <motion.div
                          variants={studentVariants}
                          custom={1}
                          className="relative mx-1 flex flex-col items-center"
                        >
                          {/* Student info - Positioned higher */}
                          <div
                            className="absolute top-2 left-0 right-0 flex flex-col items-center"
                            style={{ top: "-40px" }}
                          >
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shadow-md border-2 mb-1 bg-gray-100"
                              style={{ borderColor: medalColors[1].border }}
                            >
                              <span
                                className="font-bold text-lg"
                                style={{ color: medalColors[1].text }}
                              >
                                {topStudents[1]?.name.charAt(0)}
                              </span>
                            </div>
                            <div className="px-2 py-0.5 rounded-full text-xs bg-gray-300 text-gray-800 shadow-sm border border-gray-200 mb-1 flex items-center">
                              <FaMedal
                                className="text-gray-400 mr-0.5"
                                size={10}
                              />
                              <span>2nd</span>
                            </div>
                            <div className="text-xs font-semibold max-w-[70px] text-center truncate">
                              {topStudents[1]?.name}
                            </div>
                          </div>

                          {/* Podium */}
                          <motion.div
                            className="w-20 rounded-t-lg flex items-center justify-center"
                            initial={{ height: 0 }}
                            animate={{ height: 70 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              background: medalColors[1].podium,
                              marginTop: "60px",
                            }}
                          >
                            <div className="font-bold text-white text-shadow">
                              {topStudents[1]?.percentage}%
                            </div>
                          </motion.div>
                        </motion.div>

                        {/* First Place */}
                        <motion.div
                          variants={studentVariants}
                          custom={0}
                          className="relative mx-2 flex flex-col items-center z-10"
                        >
                          {/* Student info - Positioned higher */}
                          <div
                            className="absolute top-2 left-0 right-0 flex flex-col items-center"
                            style={{ top: "-60px" }}
                          >
                            <FaCrown className="text-yellow-500 text-2xl mb-1" />
                            <div
                              className="w-[4.5rem] h-[4.5rem] rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 mb-1 bg-yellow-50"
                              style={{ borderColor: medalColors[0].border }}
                            >
                              <span
                                className="font-bold text-2xl"
                                style={{ color: medalColors[0].text }}
                              >
                                {topStudents[0]?.name.charAt(0)}
                              </span>
                            </div>
                            <div className="px-2.5 py-0.5 rounded-full text-xs bg-amber-300 text-amber-900 shadow-sm border border-amber-400 mb-1 flex items-center">
                              <FaCrown
                                className="text-amber-500 mr-0.5"
                                size={10}
                              />
                              <span>1st</span>
                            </div>
                            <div className="text-sm font-bold max-w-[80px] text-center truncate">
                              {topStudents[0]?.name}
                            </div>
                          </div>

                          {/* Podium */}
                          <motion.div
                            className="w-24 rounded-t-lg flex items-center justify-center"
                            initial={{ height: 0 }}
                            animate={{ height: 100 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              background: medalColors[0].podium,
                              marginTop: "70px",
                            }}
                          >
                            <div className="font-bold text-white text-shadow text-lg">
                              {topStudents[0]?.percentage}%
                            </div>
                          </motion.div>
                        </motion.div>

                        {/* Third Place */}
                        <motion.div
                          variants={studentVariants}
                          custom={2}
                          className="relative mx-1 flex flex-col items-center"
                        >
                          {/* Student info - Positioned higher */}
                          <div
                            className="absolute top-2 left-0 right-0 flex flex-col items-center"
                            style={{ top: "-30px" }}
                          >
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shadow-md border-2 mb-1 bg-amber-50"
                              style={{ borderColor: medalColors[2].border }}
                            >
                              <span
                                className="font-bold"
                                style={{ color: medalColors[2].text }}
                              >
                                {topStudents[2]?.name.charAt(0)}
                              </span>
                            </div>
                            <div className="px-2 py-0.5 rounded-full text-xs bg-amber-200 text-amber-800 shadow-sm border border-amber-300 mb-1 flex items-center">
                              <IoRibbon
                                className="text-amber-700 mr-0.5"
                                size={10}
                              />
                              <span>3rd</span>
                            </div>
                            <div className="text-xs font-semibold max-w-[60px] text-center truncate">
                              {topStudents[2]?.name}
                            </div>
                          </div>

                          {/* Podium */}
                          <motion.div
                            className="w-[4.5rem] rounded-t-lg flex items-center justify-center"
                            initial={{ height: 0 }}
                            animate={{ height: 50 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              background: medalColors[2].podium,
                              marginTop: "55px",
                            }}
                          >
                            <div className="font-bold text-white text-shadow text-sm">
                              {topStudents[2]?.percentage}%
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>

                      {/* Podium Base */}
                      <motion.div
                        initial={{ scaleY: 0, originY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.2 }}
                        className="h-2.5 rounded-lg w-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300"
                      />
                    </motion.div>
                  )}

                  <div className="mt-6 mb-2">
                    <div className="text-sm font-medium text-gray-500 flex items-center">
                      <FaTrophy className="mr-1.5 text-amber-500" size={12} />
                      LEADERBOARD RANKING
                    </div>
                  </div>

                  {/* List of students - Simplified animations */}
                  <div className="space-y-2 mb-4">
                    {topStudents.map((student, index) => (
                      <motion.div
                        key={student.name}
                        custom={index}
                        variants={listItemVariants}
                        whileHover="hover"
                        className="bg-white border rounded-lg p-3 flex items-center shadow-sm"
                        style={{
                          borderColor:
                            index < 3 ? medalColors[index].border : "#e5e7eb",
                          borderLeftWidth: index < 3 ? "4px" : "1px",
                          backgroundColor:
                            index % 2 === 0
                              ? "white"
                              : "rgba(249, 250, 251, 0.5)",
                        }}
                      >
                        <div
                          className={`flex justify-center items-center rounded-full ${
                            index < 3 ? "w-8 h-8" : "w-6 h-6"
                          }`}
                          style={{
                            background:
                              index < 3 ? medalColors[index].bg : "#f3f4f6",
                          }}
                        >
                          <span
                            className={`${
                              index < 3 ? "text-white" : "text-gray-600"
                            } flex items-center justify-center font-bold ${
                              index < 3 ? "text-sm" : "text-xs"
                            }`}
                          >
                            {renderMedalIcon(index)}
                          </span>
                        </div>

                        <div className="flex-1 ml-3 truncate font-medium text-gray-700">
                          {student.name}
                        </div>

                        <div
                          className="font-bold text-sm px-2.5 py-1 rounded-lg"
                          style={{
                            background:
                              index < 3
                                ? `linear-gradient(135deg, ${
                                    index === 0
                                      ? "#fff9c4"
                                      : index === 1
                                      ? "#f5f5f5"
                                      : "#fff3e0"
                                  }, ${
                                    index === 0
                                      ? "#fffde7"
                                      : index === 1
                                      ? "#fafafa"
                                      : "#fff8e1"
                                  })`
                                : "#f3f4f6",
                            color:
                              index < 3
                                ? index === 0
                                  ? "#f59e0b"
                                  : index === 1
                                  ? "#6b7280"
                                  : "#d97706"
                                : "#374151",
                          }}
                        >
                          {student.percentage}%
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* View full leaderboard button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      (window.location.href = "/student-dashboard/leaderboards")
                    }
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center shadow-md"
                  >
                    <span>View Full Leaderboard</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text shadow style */}
      <style jsx global>{`
        .text-shadow {
          text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default FloatingLeaderboardButton;
