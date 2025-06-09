import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCommentDots,
  FaFilter,
  FaDownload,
  FaTrash,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaUserGraduate,
  FaLayerGroup,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import * as XLSX from "xlsx";

const AdminFeedbackDisplay = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [resolvedFeedbacks, setResolvedFeedbacks] = useState([]);
  const feedbacksPerPage = 10;
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "Feedbacks"),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);

        const feedbackData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp
            ? doc.data().timestamp.toDate()
            : new Date(),
        }));

        setFeedback(feedbackData);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  // Handle filtering
  const filteredFeedback = feedback.filter((item) => {
    const typeMatch = filterType ? item.feedback === filterType : true;
    const classMatch = filterClass ? item.class === filterClass : true;
    const batchMatch = filterBatch ? item.batch === filterBatch : true;
    return typeMatch && classMatch && batchMatch;
  });

  // Handle sorting
  const sortedFeedback = [...filteredFeedback].sort((a, b) => {
    if (sortBy === "newest") {
      return b.timestamp - a.timestamp;
    } else {
      return a.timestamp - b.timestamp;
    }
  });

  // Get unique values for filters
  const uniqueFeedbackTypes = [
    ...new Set(feedback.map((item) => item.feedback)),
  ];
  const uniqueClasses = [...new Set(feedback.map((item) => item.class))];
  const uniqueBatches = [...new Set(feedback.map((item) => item.batch))];

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Export to Excel
  const handleExport = () => {
    const dataToExport = sortedFeedback.map((item) => ({
      Class: item.class || "Not specified",
      Batch: item.batch || "Not specified",
      Feedback: item.feedback || "No feedback provided",
      "Date & Time": formatDate(item.timestamp),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feedback");
    XLSX.writeFile(wb, "student_feedback.xlsx");
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await deleteDoc(doc(db, "Feedbacks", id));
        setFeedback((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        alert("Failed to delete feedback.");
      }
    }
  };

  // Handle resolve
  const handleResolve = (id) => {
    setResolvedFeedbacks((prev) => [...prev, id]);
  };

  // Pagination logic
  const indexOfLast = currentPage * feedbacksPerPage;
  const indexOfFirst = indexOfLast - feedbacksPerPage;
  const currentFeedbacks = sortedFeedback.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedFeedback.length / feedbacksPerPage);

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-200">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg mr-3">
              <FaCommentDots className="text-xl" />
            </span>
            Student Feedback Dashboard
          </h2>
          <p className="text-gray-600 mt-2">
            View and manage student feedback submissions
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center font-medium"
          >
            <FaDownload className="mr-2" /> Export to Excel
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <FaCommentDots className="text-lg text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Feedback</div>
            <div className="text-xl font-bold">{feedback.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-green-100 p-3 rounded-lg mr-4">
            <FaCheck className="text-lg text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Resolved</div>
            <div className="text-xl font-bold">{resolvedFeedbacks.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg mr-4">
            <FaUserGraduate className="text-lg text-purple-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Classes</div>
            <div className="text-xl font-bold">{uniqueClasses.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-amber-100 p-3 rounded-lg mr-4">
            <FaLayerGroup className="text-lg text-amber-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Batches</div>
            <div className="text-xl font-bold">{uniqueBatches.length}</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-8"
      >
        <div className="flex items-center mb-5">
          <FaFilter className="text-indigo-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-700">Filter & Sort</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Feedback Type
            </label>
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2.5 px-4 appearance-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white pr-10 outline-none transition-all duration-200"
              >
                <option value="">All Feedbacks</option>
                {uniqueFeedbackTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <FaCommentDots />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Class
            </label>
            <div className="relative">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full p-2.5 px-4 appearance-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white pr-10 outline-none transition-all duration-200"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <FaUserGraduate />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Batch
            </label>
            <div className="relative">
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="w-full p-2.5 px-4 appearance-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white pr-10 outline-none transition-all duration-200"
              >
                <option value="">All Batches</option>
                {uniqueBatches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <FaLayerGroup />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-48">
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Sort by
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2.5 px-4 appearance-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white pr-10 outline-none transition-all duration-200"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                {sortBy === "newest" ? (
                  <FaSortAmountDown />
                ) : (
                  <FaSortAmountUp />
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setFilterType("");
              setFilterClass("");
              setFilterBatch("");
            }}
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            <FaTimes className="mr-2" /> Clear Filters
          </button>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          Showing {currentFeedbacks.length} of {sortedFeedback.length} feedbacks
        </div>
        <div className="text-sm text-gray-500">
          {resolvedFeedbacks.length > 0 && (
            <span>{resolvedFeedbacks.length} resolved</span>
          )}
        </div>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 flex flex-col items-center justify-center shadow-sm border border-gray-100">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-indigo-600 animate-spin rounded-full"></div>
          </div>
          <p className="text-gray-500 mt-4 font-medium">Loading feedbacks...</p>
        </div>
      ) : sortedFeedback.length === 0 ? (
        <div className="bg-white rounded-xl p-12 flex flex-col items-center justify-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaCommentDots className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Feedback Found
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            {filterType || filterClass || filterBatch
              ? "Try changing your filters or clearing them to see more results."
              : "There are no feedback submissions yet."}
          </p>
          {(filterType || filterClass || filterBatch) && (
            <button
              onClick={() => {
                setFilterType("");
                setFilterClass("");
                setFilterBatch("");
              }}
              className="mt-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium px-5 py-2 rounded-lg transition-all duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <AnimatePresence>
            {currentFeedbacks.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`bg-white p-5 rounded-xl border-l-4 ${
                  resolvedFeedbacks.includes(item.id)
                    ? "border-l-green-500"
                    : "border-l-indigo-500"
                } shadow-sm hover:shadow-md transition-all duration-200`}
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-3">
                  <div className="flex items-center">
                    <span
                      className={`text-white px-4 py-1.5 rounded-lg text-sm font-medium ${
                        resolvedFeedbacks.includes(item.id)
                          ? "bg-green-500"
                          : "bg-indigo-600"
                      }`}
                    >
                      {item.feedback}
                    </span>

                    <div className="ml-3 flex items-center text-gray-500">
                      <FaCalendarAlt className="mr-1" size={12} />
                      <span className="text-xs">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {item.class && (
                      <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full border border-blue-100">
                        {item.class}
                      </span>
                    )}

                    {item.batch && (
                      <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full border border-green-100">
                        {item.batch}
                      </span>
                    )}

                    <div className="flex gap-2 ml-auto md:ml-3">
                      {userRole === "admin" &&
                        !resolvedFeedbacks.includes(item.id) && (
                          <button
                            onClick={() => handleResolve(item.id)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center"
                          >
                            <FaCheck className="mr-1" /> Resolve
                          </button>
                        )}

                      {resolvedFeedbacks.includes(item.id) && (
                        <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center">
                          <FaCheck className="mr-1" /> Resolved
                        </span>
                      )}

                      {userRole === "admin" && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200 text-sm font-medium"
          >
            First
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200 text-sm font-medium ml-2"
          >
            Previous
          </button>

          <div className="flex-1 text-center">
            <span className="px-4 py-1.5 bg-indigo-100 text-indigo-800 rounded-lg font-medium">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200 text-sm font-medium mr-2"
          >
            Next
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200 text-sm font-medium"
          >
            Last
          </button>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
        <span>
          Showing {indexOfFirst + 1} to{" "}
          {Math.min(indexOfLast, sortedFeedback.length)} of{" "}
          {sortedFeedback.length} entries
        </span>
        <span>Last updated: {new Date().toLocaleString()}</span>
      </div>
    </div>
  );
};

export default AdminFeedbackDisplay;
