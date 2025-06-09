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
import { motion } from "framer-motion";
import { FaCommentDots, FaFilter, FaDownload } from "react-icons/fa";
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
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FaCommentDots className="mr-2 text-indigo-600" />
          Student Feedback Dashboard
        </h2>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaDownload className="mr-2" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">
            <FaFilter className="inline mr-1" /> Filter by Feedback
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Feedbacks</option>
            {uniqueFeedbackTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">
            Filter by Class
          </label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">
            Filter by Batch
          </label>
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">All Batches</option>
            {uniqueBatches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-end">
          <button
            onClick={() => {
              setFilterType("");
              setFilterClass("");
              setFilterBatch("");
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : sortedFeedback.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FaCommentDots className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No feedback found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentFeedbacks.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap justify-between items-center">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full mb-2 sm:mb-0">
                  {item.feedback}
                </span>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
                    {item.class || "No class"}
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {item.batch || "No batch"}
                  </span>
                  {userRole === "admin" &&
                    !resolvedFeedbacks.includes(item.id) && (
                      <button
                        onClick={() => handleResolve(item.id)}
                        className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition"
                      >
                        Resolve
                      </button>
                    )}
                  {resolvedFeedbacks.includes(item.id) && (
                    <span className="ml-4 bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold">
                      Resolved
                    </span>
                  )}
                  {userRole === "admin" && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="ml-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-2 text-gray-500 text-sm flex justify-end">
                <span>{formatDate(item.timestamp)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <div className="mt-6 text-center border-t pt-4 text-sm text-gray-500">
        Total feedback received: {feedback.length}
      </div>
    </div>
  );
};

export default AdminFeedbackDisplay;
