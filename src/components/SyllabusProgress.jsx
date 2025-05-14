import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  FaBook,
  FaCheckCircle,
  FaHourglassHalf,
  FaRegClock,
  FaFilter,
  FaChartLine,
} from "react-icons/fa";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const SyllabusProgress = () => {
  const [syllabusData, setSyllabusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const studentClass = localStorage.getItem("studentClass") || "";
  const studentBatch = localStorage.getItem("studentBatch") || "";

  useEffect(() => {
    fetchSyllabusForClass();
  }, [studentClass, selectedSubject, selectedBatch]);

  const fetchSyllabusForClass = async () => {
    setLoading(true);
    setError(null);
    try {
      // Modified approach to avoid complex index requirements
      // First, query by class only (simpler index)
      const syllabusRef = collection(db, "syllabus");
      const basicQuery = query(syllabusRef, where("class", "==", studentClass));

      const snapshot = await getDocs(basicQuery);

      // Then filter the results in JavaScript based on other criteria
      let filteredData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Apply additional filters in memory
      if (selectedSubject) {
        filteredData = filteredData.filter(
          (item) => item.subject === selectedSubject
        );
      }

      if (selectedBatch || studentBatch) {
        const batchToFilter = selectedBatch || studentBatch;
        filteredData = filteredData.filter(
          (item) => item.batch === batchToFilter
        );
      }

      // Sort by completion status in JavaScript
      filteredData.sort((a, b) => {
        if ((a.completionStatus || 0) === (b.completionStatus || 0)) {
          return a.topic.localeCompare(b.topic); // Secondary sort by topic name
        }
        return (a.completionStatus || 0) - (b.completionStatus || 0); // Primary sort by completion
      });

      setSyllabusData(filteredData);
    } catch (error) {
      console.error("Error fetching syllabus:", error);
      setError("Failed to load syllabus data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (syllabusData.length === 0) return 0;

    const totalPercentage = syllabusData.reduce(
      (sum, item) => sum + (item.completionStatus || 0),
      0
    );

    return Math.round(totalPercentage / syllabusData.length);
  };

  // Extract unique subjects for filter
  const subjects = [
    ...new Set(syllabusData.map((item) => item.subject)),
  ].sort();

  // Extract unique batches for filter
  const batches = [
    ...new Set(
      syllabusData.filter((item) => item.batch).map((item) => item.batch)
    ),
  ].sort();

  const progressColorClass = (status) => {
    if (status < 25) return "bg-red-500";
    if (status < 50) return "bg-yellow-500";
    if (status < 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const overallProgress = calculateOverallProgress();
  const overallProgressColor = progressColorClass(overallProgress);

  // Group items by subject for better organization
  const groupedBySubject = syllabusData.reduce((acc, item) => {
    const subject = item.subject || "Other";
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(item);
    return acc;
  }, {});

  return (
    <motion.div
      className="p-6 max-w-5xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaBook className="mr-2 text-green-600" /> Syllabus Progress
        </h2>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Overall Progress Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-700 mb-1 flex items-center">
              <FaChartLine className="mr-2 text-blue-600" /> Overall Syllabus
              Progress
            </h3>
            <p className="text-sm text-gray-600">
              Class: <span className="font-medium">{studentClass}</span>
              {studentBatch && (
                <span className="ml-2">
                  Batch: <span className="font-medium">{studentBatch}</span>
                </span>
              )}
            </p>
          </div>
          <div className="text-3xl font-bold text-blue-700">
            {overallProgress}%
          </div>
        </div>

        <div className="mt-4">
          <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-4 rounded-full ${overallProgressColor}`}
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>

          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <div className="flex items-center">
              <FaHourglassHalf className="mr-1 text-yellow-500" />
              <span>
                {
                  syllabusData.filter(
                    (item) => (item.completionStatus || 0) < 100
                  ).length
                }{" "}
                topics in progress
              </span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className="mr-1 text-green-500" />
              <span>
                {
                  syllabusData.filter(
                    (item) => (item.completionStatus || 0) === 100
                  ).length
                }{" "}
                topics completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center">
            <FaFilter className="text-gray-500 mr-2" />
            <span className="text-gray-700 font-medium">Filter by:</span>
          </div>

          <div className="flex-1">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {batches.length > 0 && (
            <div className="flex-1">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Syllabus Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          <span className="ml-3 text-gray-600">Loading syllabus...</span>
        </div>
      ) : syllabusData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FaBook className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">
            No syllabus items found
          </h3>
          <p className="text-gray-500">
            Your teacher has not added any syllabus items yet for {studentClass}
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Group by subject */}
          {Object.entries(groupedBySubject).map(([subject, items]) => (
            <div
              key={subject}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800">
                  {subject}
                </h3>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-2 sm:mb-0">
                          <h4 className="font-medium text-gray-800">
                            {item.topic}
                          </h4>
                          {item.batch && (
                            <span className="inline-block mt-1 text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                              {item.batch}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">
                            {item.completionStatus || 0}%
                          </span>
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${progressColorClass(
                                item.completionStatus || 0
                              )}`}
                              style={{
                                width: `${item.completionStatus || 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {item.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {item.description}
                        </p>
                      )}

                      {item.estimatedCompletionDate && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                          <FaRegClock className="mr-1" />
                          Target completion:{" "}
                          {new Date(
                            item.estimatedCompletionDate
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SyllabusProgress;
