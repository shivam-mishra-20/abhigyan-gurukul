import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { logEvent } from "../utils/logEvent";

// Add the teachers array
const teachers = [
  "Pratyaksha Ma'am",
  "Dhara Ma'am",
  "Sonia Ma'am",
  "Preeti Ma'am",
  "Abhigyan Sir",
  "Chandan Sir",
  "Nitesh Sir",
  "Kedar Sir",
  "Ankit Sir",
  "Milan Sir",
  "Nitish Sir",
  "Prakash Sir",
];

const SyllabusReport = () => {
  const userRole = localStorage.getItem("userRole");
  const [userName, setUserName] = useState(""); // State to store the current user's name
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportClass, setReportClass] = useState("");
  const [reportBatch, setReportBatch] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportStart, setReportStart] = useState("");
  const [reportEnd, setReportEnd] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [reportSubjects, setReportSubjects] = useState("");
  const [reportBy, setReportBy] = useState(""); // New state for the "By" field
  const [sent, setSent] = useState(false);
  const [reports, setReports] = useState([]);

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const reportsPerPage = 3;

  // Admin and Teacher report viewing states
  const [adminViewMode, setAdminViewMode] = useState(false);
  const [adminReports, setAdminReports] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [adminFilterDate, setAdminFilterDate] = useState("");
  const [adminFilterSubject, setAdminFilterSubject] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);

  const reportsExist = reports.length > 0;

  // Get list of all available subjects from reports
  const availableSubjects = [
    ...new Set(reports.map((report) => report.subjects)),
  ].filter(Boolean);

  // Get available subjects for admin filter
  const availableAdminSubjects = [
    ...new Set(adminReports.map((report) => report.subjects)),
  ].filter(Boolean);

  // Get available classes and batches
  const availableClasses = ["8", "9", "10", "11", "12"];
  const availableBatches = ["Lakshya", "Aadharshila", "Basic"];

  // Get current user name when component mounts
  useEffect(() => {
    const currentUserName =
      userRole === "student"
        ? localStorage.getItem("studentName")
        : localStorage.getItem("userName") || "Teacher"; // Fallback to "Teacher" if not found

    setUserName(currentUserName);
  }, [userRole]);

  useEffect(() => {
    const fetchStudent = async () => {
      if (userRole === "student") {
        setLoading(true);
        const username = localStorage.getItem("studentName");
        const q = query(collection(db, "Users"), where("name", "==", username));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setStudentData(snapshot.docs[0].data());
        }
        setLoading(false);
      }
    };
    fetchStudent();
  }, [userRole]);

  useEffect(() => {
    const fetchReports = async () => {
      if (userRole === "student" && studentData) {
        const classString = studentData.Class?.toString().startsWith("Class ")
          ? studentData.Class
          : `Class ${studentData.Class}`;
        const q = query(
          collection(db, "SyllabusReport"),
          where("class", "==", classString),
          where("batch", "==", studentData.batch)
        );
        const snapshot = await getDocs(q);
        setReports(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    };
    fetchReports();
  }, [userRole, studentData]);

  useEffect(() => {
    setReportDate(new Date().toISOString().split("T")[0]); // Set today's date as default
  }, []);

  // Fetch reports for admin/teacher view
  const fetchAdminReports = async () => {
    if (!adminViewMode) return;

    setAdminLoading(true);
    try {
      let q = collection(db, "SyllabusReport");
      let constraints = [];

      if (filterClass) {
        constraints.push(where("class", "==", `Class ${filterClass}`));
      }

      if (filterBatch) {
        constraints.push(where("batch", "==", filterBatch));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      } else {
        q = query(q);
      }

      const snapshot = await getDocs(q);
      const fetchedReports = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAdminReports(fetchedReports);
    } catch (error) {
      console.error("Error fetching admin reports:", error);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "admin" || userRole === "teacher") {
      fetchAdminReports();
    }
  }, [adminViewMode, filterClass, filterBatch]);

  // Handle deleting a report
  const handleDeleteReport = async (reportId) => {
    if (userRole !== "admin") return;

    try {
      await deleteDoc(doc(db, "SyllabusReport", reportId));
      setAdminReports((prevReports) =>
        prevReports.filter((report) => report.id !== reportId)
      );
      setDeleteConfirm(null);
      await logEvent(`Syllabus report deleted: ${reportId}`);
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report. Please try again.");
    }
  };

  // Handle deleting all filtered reports
  const handleDeleteAllReports = async () => {
    if (userRole !== "admin") return;

    try {
      // Delete all reports that match the current filters
      const deletePromises = filteredAdminReports.map((report) =>
        deleteDoc(doc(db, "SyllabusReport", report.id))
      );

      await Promise.all(deletePromises);

      // Update the state
      setAdminReports((prevReports) =>
        prevReports.filter(
          (report) => !filteredAdminReports.some((r) => r.id === report.id)
        )
      );
      setDeleteAllConfirm(false);
      await logEvent(
        `Bulk deleted syllabus reports: ${filteredAdminReports.length} reports`
      );
    } catch (error) {
      console.error("Error deleting reports:", error);
      alert("Failed to delete reports. Please try again.");
    }
  };

  // Apply filters to reports
  const filteredReports = reports.filter((report) => {
    // Filter by subject if filter is active
    if (filterSubject && report.subjects !== filterSubject) {
      return false;
    }

    // Filter by date if filter is active
    if (filterDate) {
      return report.date === filterDate;
    }

    return true;
  });

  // Apply filters to admin reports
  const filteredAdminReports = adminReports.filter((report) => {
    // Filter by subject if filter is active
    if (adminFilterSubject && report.subjects !== adminFilterSubject) {
      return false;
    }

    // Filter by date if filter is active
    if (adminFilterDate && report.date !== adminFilterDate) {
      return false;
    }

    return true;
  });

  // Calculate pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(
    indexOfFirstReport,
    indexOfLastReport
  );
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  // Calculate pagination for admin view
  const indexOfLastAdminReport = adminCurrentPage * reportsPerPage;
  const indexOfFirstAdminReport = indexOfLastAdminReport - reportsPerPage;
  const currentAdminReports = filteredAdminReports.slice(
    indexOfFirstAdminReport,
    indexOfLastAdminReport
  );
  const totalAdminPages = Math.ceil(
    filteredAdminReports.length / reportsPerPage
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Change page for admin view
  const paginateAdmin = (pageNumber) => setAdminCurrentPage(pageNumber);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSubject, filterDate]);

  // Reset page when admin filters change
  useEffect(() => {
    setAdminCurrentPage(1);
  }, [adminFilterSubject, adminFilterDate, filterClass, filterBatch]);

  // Reset filters
  const resetFilters = () => {
    setFilterSubject("");
    setFilterDate("");
  };

  // Reset admin filters
  const resetAdminFilters = () => {
    setAdminFilterSubject("");
    setAdminFilterDate("");
    setFilterClass("");
    setFilterBatch("");
  };

  // Render the delete confirmation modal
  const renderDeleteConfirmation = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <svg
            className="w-6 h-6 text-red-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Confirm Delete
        </h3>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this report? This action cannot be
          undone.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteReport(deleteConfirm)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Render the delete all confirmation modal
  const renderDeleteAllConfirmation = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <svg
            className="w-6 h-6 text-red-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Confirm Delete All
        </h3>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete all {filteredAdminReports.length}{" "}
          reports that match your current filters? This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setDeleteAllConfirm(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAllReports}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete All
          </button>
        </div>
      </div>
    </div>
  );

  // Render admin/teacher report viewing section
  const renderAdminReportView = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mt-8">
      <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white p-6">
        <div className="flex flex-wrap items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              ></path>
            </svg>
            View All Reports
          </h3>

          {/* Delete All button (admin only) */}
          {userRole === "admin" && filteredAdminReports.length > 0 && (
            <button
              onClick={() => setDeleteAllConfirm(true)}
              className="mt-2 sm:mt-0 bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete All
            </button>
          )}
        </div>
        <p className="mt-2 text-gray-600 text-sm">
          {userRole === "admin"
            ? "Manage and view all syllabus reports"
            : "View syllabus reports for classes"}
        </p>
      </div>

      {/* Filters Section */}
      <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex flex-wrap items-start gap-4">
          <div>
            <label
              htmlFor="filterClass"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Class
            </label>
            <select
              id="filterClass"
              className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filterBatch"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Batch
            </label>
            <select
              id="filterBatch"
              className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
            >
              <option value="">All Batches</option>
              {availableBatches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="adminFilterSubject"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Subject
            </label>
            <select
              id="adminFilterSubject"
              className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={adminFilterSubject}
              onChange={(e) => setAdminFilterSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {availableAdminSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="adminFilterDate"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Date
            </label>
            <input
              id="adminFilterDate"
              type="date"
              className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={adminFilterDate}
              onChange={(e) => setAdminFilterDate(e.target.value)}
            />
          </div>

          {(adminFilterSubject ||
            adminFilterDate ||
            filterClass ||
            filterBatch) && (
            <div className="self-end mb-1">
              <button
                onClick={resetAdminFilters}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded flex items-center transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reports List */}
      {adminLoading ? (
        <div className="flex justify-center items-center p-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading reports...</span>
        </div>
      ) : filteredAdminReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-blue-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">
            No Reports Found
          </h4>
          <p className="text-gray-500 text-center max-w-md">
            {adminFilterSubject || adminFilterDate || filterClass || filterBatch
              ? "No reports match the selected filters. Try changing your filters or check back later."
              : "No syllabus reports have been created yet. Add a new report to get started."}
          </p>
        </div>
      ) : (
        <div className="p-6">
          <div className="mb-3 flex justify-between items-center">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredAdminReports.length}{" "}
              {filteredAdminReports.length === 1 ? "report" : "reports"} found
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {currentAdminReports.map((report) => (
              <div
                key={report.id}
                className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              >
                <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {report.subjects || "General Report"}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                        <span>{report.class}</span>
                        <span>•</span>
                        <span>{report.batch} batch</span>
                        <span>•</span>
                        <span>
                          Added{" "}
                          {new Date(
                            report.createdAt?.toDate()
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          by {report.reportBy || report.createdBy || "Teacher"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                      {report.date}
                    </div>

                    {/* Delete button (admin only) */}
                    {userRole === "admin" && (
                      <button
                        onClick={() => setDeleteConfirm(report.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                        title="Delete Report"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-500 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">
                    {report.startTime} - {report.endTime}
                  </span>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-100">
                  <h5 className="text-xs uppercase text-gray-500 mb-2 font-semibold tracking-wider">
                    Notes
                  </h5>
                  <p className="text-gray-700">{report.notes}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination for Admin View */}
          {totalAdminPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => paginateAdmin(Math.max(1, adminCurrentPage - 1))}
                disabled={adminCurrentPage === 1}
                className={`px-3 py-1 rounded ${
                  adminCurrentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } transition-colors flex items-center`}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Prev
              </button>

              <div className="flex items-center space-x-1">
                {[...Array(totalAdminPages).keys()].map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => paginateAdmin(number + 1)}
                    className={`w-8 h-8 rounded-full ${
                      adminCurrentPage === number + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } transition-colors flex items-center justify-center`}
                  >
                    {number + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  paginateAdmin(Math.min(totalAdminPages, adminCurrentPage + 1))
                }
                disabled={adminCurrentPage === totalAdminPages}
                className={`px-3 py-1 rounded ${
                  adminCurrentPage === totalAdminPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } transition-colors flex items-center`}
              >
                Next
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Delete confirmation modals */}
      {deleteConfirm && renderDeleteConfirmation()}
      {deleteAllConfirm && renderDeleteAllConfirmation()}

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-700">
              Class
            </span>{" "}
            Report
          </h2>
          <p className="mt-2 text-gray-600 text-sm md:text-base">
            {userRole === "student"
              ? "View your class syllabus progress and updates"
              : "Create and manage syllabus reports for students"}
          </p>
        </div>

        {userRole !== "student" && (
          <div className="flex flex-wrap gap-2 items-center mt-4 md:mt-0">
            <div className="bg-white p-2 rounded-full shadow-sm flex items-center text-sm">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-2"></span>
              <span className="text-gray-600 font-medium">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <button
              onClick={() => setAdminViewMode(!adminViewMode)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                adminViewMode
                  ? "bg-blue-500 text-white"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}
            >
              {adminViewMode ? "Create Report" : "View Reports"}
            </button>
          </div>
        )}
      </div>

      {/* Render admin/teacher report view if adminViewMode is true */}
      {userRole !== "student" && adminViewMode ? (
        renderAdminReportView()
      ) : userRole === "student" ? (
        loading ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-gray-200 opacity-25 animate-spin"></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-green-500 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-600">
              Loading your details...
            </p>
            <p className="text-sm text-gray-400">Please wait a moment</p>
          </div>
        ) : studentData ? (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 border-t border-green-500 transform transition-all duration-300 hover:translate-y-[-4px]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {studentData.name?.charAt(0).toUpperCase() || "S"}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {studentData.name}
                    </h3>
                    <p className="text-sm text-gray-500">Student Profile</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    {studentData.Class || "N/A"}
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {studentData.batch || "N/A"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <div className="text-sm text-gray-500 mb-1">
                    Academic Year
                  </div>
                  <div className="font-semibold text-gray-800">
                    {new Date().getFullYear()}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-400">
                  <div className="text-sm text-gray-500 mb-1">
                    Reports Available
                  </div>
                  <div className="font-semibold text-gray-800">
                    {reports.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      ></path>
                    </svg>
                    Class Reports
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {filteredReports.length}{" "}
                    {filteredReports.length === 1 ? "report" : "reports"} found
                  </span>
                </div>
                <p className="mt-2 text-gray-600 text-sm">
                  Latest syllabus progress reports for your class and batch
                </p>
              </div>

              {/* Filter Section */}
              <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <label
                        htmlFor="filterSubject"
                        className="block text-xs font-medium text-gray-500 mb-1"
                      >
                        Filter by Subject
                      </label>
                      <select
                        id="filterSubject"
                        className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                      >
                        <option value="">All Subjects</option>
                        {availableSubjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="filterDate"
                        className="block text-xs font-medium text-gray-500 mb-1"
                      >
                        Filter by Date
                      </label>
                      <input
                        id="filterDate"
                        type="date"
                        className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {(filterSubject || filterDate) && (
                    <button
                      onClick={resetFilters}
                      className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded flex items-center transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                    No Reports Found
                  </h4>
                  <p className="text-gray-500 text-center max-w-md">
                    {filterSubject || filterDate
                      ? "No reports match the selected filters. Try changing your filters or check back later."
                      : "No syllabus reports have been created for your class and batch yet. Check back later for updates."}
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                    {currentReports.map((rep) => (
                      <div
                        key={rep.id}
                        className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                ></path>
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {rep.subjects || "General Report"}
                              </h4>
                              <p className="text-xs text-gray-500">
                                Added{" "}
                                {new Date(
                                  rep.createdAt?.toDate()
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                by {rep.reportBy || rep.createdBy || "Teacher"}
                              </p>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                            {rep.date}
                          </div>
                        </div>

                        <div className="mb-3 flex items-center">
                          <svg
                            className="w-4 h-4 text-gray-500 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          <span className="text-sm text-gray-600 font-medium">
                            {rep.startTime} - {rep.endTime}
                          </span>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-100">
                          <h5 className="text-xs uppercase text-gray-500 mb-2 font-semibold tracking-wider">
                            Notes
                          </h5>
                          <p className="text-gray-700">{rep.notes}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {rep.batch} batch
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        } transition-colors flex items-center`}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Prev
                      </button>

                      <div className="flex items-center space-x-1">
                        {[...Array(totalPages).keys()].map((number) => (
                          <button
                            key={number + 1}
                            onClick={() => paginate(number + 1)}
                            className={`w-8 h-8 rounded-full ${
                              currentPage === number + 1
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } transition-colors flex items-center justify-center`}
                          >
                            {number + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          paginate(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        } transition-colors flex items-center`}
                      >
                        Next
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No details found for your account.
                </p>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-6 text-center text-gray-700">
            Create Syllabus Report
          </h3>

          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              await addDoc(collection(db, "SyllabusReport"), {
                class: `Class ${reportClass}`,
                batch: reportBatch,
                date: reportDate,
                startTime: reportStart,
                endTime: reportEnd,
                subjects: reportSubjects,
                notes: reportNotes,
                createdAt: new Date(),
                sender: userRole,
                createdBy: userName,
                reportBy: reportBy, // Add the "By" field to the document
              });
              setSent(true);
              setTimeout(() => setSent(false), 2000);
              setReportClass("");
              setReportBatch("");
              setReportDate(new Date().toISOString().split("T")[0]);
              setReportStart("");
              setReportEnd("");
              setReportSubjects("");
              setReportNotes("");
              setReportBy("");
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Class
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  value={reportClass}
                  onChange={(e) => setReportClass(e.target.value)}
                  required
                >
                  <option value="">Select class</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Batch
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  value={reportBatch}
                  onChange={(e) => setReportBatch(e.target.value)}
                  required
                >
                  <option value="">Select batch</option>
                  <option value="Lakshya">Lakshya</option>
                  <option value="Aadharshila">Aadharshila</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Subject
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  value={reportSubjects}
                  onChange={(e) => setReportSubjects(e.target.value)}
                  required
                >
                  <option value="">Select subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="English">English</option>
                  <option value="Biology">Biology</option>
                  <option value="Language">Language</option>
                  <option value="Social Science">Social Science</option>
                </select>
              </div>
            </div>

            {/* Add the "By" field */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                By
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                value={reportBy}
                onChange={(e) => setReportBy(e.target.value)}
                required
              >
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Class Timing
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors mb-3"
                value={reportStart + "-" + reportEnd}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    setReportStart("");
                    setReportEnd("");
                  } else {
                    const [start, end] = val.split("-");
                    setReportStart(start);
                    setReportEnd(end);
                  }
                }}
                required={!reportStart || !reportEnd}
              >
                <option value="">Select timing</option>
                <option value="15:30-16:30">3:30PM-4:30PM</option>
                <option value="16:30-17:30">4:30PM-5:30PM</option>
                <option value="17:30-18:30">5:30PM-6:30PM</option>
                <option value="18:30-19:30">6:30PM-7:30PM</option>
                <option value="19:30-20:30">7:30PM-8:30PM</option>
                <option value="custom">Custom</option>
              </select>

              {(reportStart === "" || reportEnd === "") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      value={reportStart}
                      onChange={(e) => setReportStart(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">
                      End Time
                    </label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      value={reportEnd}
                      onChange={(e) => setReportEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Notes/Description
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors min-h-[120px]"
                placeholder="Enter detailed notes about what was covered in class..."
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                required
              />
            </div>

            <div className="pt-5">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-md font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 shadow-md hover:shadow-lg transition-all"
              >
                Submit Report
              </button>

              {sent && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mt-4 flex items-center">
                  <svg
                    className="h-5 w-5 mr-2 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Report successfully submitted!
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SyllabusReport;
