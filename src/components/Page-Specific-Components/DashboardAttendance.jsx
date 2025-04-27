// src/components/Page-Specific-Components/DashboardAttendance.jsx
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFileExcel,
  FaSync,
  FaUpload,
  FaFilter,
  FaCalendarAlt,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaRegCalendarCheck,
  FaTrash,
  FaUserCheck,
} from "react-icons/fa";

export default function DashboardAttendance() {
  // — state —
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(""); // "YYYY-MM"
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const recordsPerPage = 6;

  const userRole = localStorage.getItem("userRole");
  const studentName = localStorage.getItem("studentName") || "";
  const studentClass = localStorage.getItem("studentClass") || "";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 15 },
    },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 100,
      },
    }),
    exit: { opacity: 0, x: 20 },
  };

  // — helpers —
  const excelDateToISO = (value) => {
    if (!value) return "";
    // Excel serial?
    if (!isNaN(value)) {
      const d = new Date(Math.round((value - 25569) * 86400 * 1000));
      return d.toISOString().split("T")[0];
    }
    const parsed = new Date(value);
    return !isNaN(parsed) ? parsed.toISOString().split("T")[0] : "";
  };

  // — Admin/Teacher: handle file selection —
  const handleFileChange = (e) => {
    setStatus("");
    setShowStatus(false);
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  // — Admin/Teacher: process & upload Excel —
  const handleUpload = async () => {
    if (!file) {
      setStatus("⚠️ Please select an Excel file first.");
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
      return;
    }
    try {
      setIsSubmitting(true);
      setStatus("⏳ Processing...");
      setShowStatus(true);

      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });
      console.log("Parsed rows:", rows);

      for (let row of rows) {
        // 1️⃣ normalize headers to lowercase keys
        const norm = {};
        Object.entries(row).forEach(([k, v]) => {
          norm[k.trim().toLowerCase()] = v;
        });

        const cls = norm["class"]?.toString().trim();
        const name = norm["name"]?.toString().trim();
        const clockIn = norm["clock in"]?.toString().trim();
        const clockOut = norm["clock out"]?.toString().trim();
        const rawDate = norm["day and date"];
        // 2️⃣ convert date to ISO format
        // Excel date format (serial number) or string date (e.g., "2023-10-01")
        const dayAndDate = excelDateToISO(rawDate);

        if (!cls || !name || !clockIn || !clockOut || !dayAndDate) {
          console.warn("Skipping malformed row:", row);
          continue;
        }

        // build doc ID (must match your sync logic)
        const docId = `${name.replace(/\s+/g, "").toLowerCase()}_${cls
          .replace(/\s+/g, "")
          .toLowerCase()}`;
        const ref = doc(db, "studentLeaves", docId);

        // ensure it exists
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, { name, Class: cls, attendance: [] });
        }

        // append if not duplicate
        const data = (await getDoc(ref)).data();
        const arr = data.attendance || [];
        if (!arr.some((e) => e.dayAndDate === dayAndDate)) {
          await updateDoc(ref, {
            attendance: arrayUnion({ clockIn, clockOut, dayAndDate }),
          });
        }
      }

      setStatus("✅ Attendance uploaded successfully!");
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
      setFile(null);
      document.getElementById("attendance-upload").value = "";
    } catch (e) {
      console.error(e);
      setStatus("❌ Failed to upload attendance.");
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // — Admin/Teacher: sync all students into studentLeaves (no overwrite) —
  // 🔄 Sync student entries from Users → studentLeaves (without wiping existing attendance)
  const handleSyncStudents = async () => {
    setIsLoading(true);
    setStatus("⏳ Syncing students...");
    setShowStatus(true);

    try {
      const snap = await getDocs(
        query(collection(db, "Users"), where("role", "==", "student"))
      );

      for (let u of snap.docs) {
        const { name, Class } = u.data();
        if (!name || !Class) continue;

        const docId = `${name
          .replace(/\s+/g, "")
          .toLowerCase()}_${Class.replace(/\s+/g, "").toLowerCase()}`;
        const ref = doc(db, "studentLeaves", docId);

        // only create if it doesn't already exist
        const existing = await getDoc(ref);
        if (existing.exists()) {
          continue;
        }

        // create new doc with empty attendance array
        await setDoc(ref, {
          name,
          Class,
          attendance: [],
        });
      }

      setStatus("✅ Synced students to 'studentLeaves'.");
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    } catch (e) {
      console.error(e);
      setStatus("❌ Sync failed.");
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // — Student: load their attendance via query on name & class —
  useEffect(() => {
    if (userRole === "student") {
      (async () => {
        setIsLoading(true);
        try {
          const q = query(
            collection(db, "studentLeaves"),
            where("name", "==", studentName),
            where("Class", "==", studentClass)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            setAttendanceRecords(snap.docs[0].data().attendance || []);
          } else {
            setAttendanceRecords([]);
          }
        } catch (e) {
          console.error("Error loading attendance:", e);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [userRole, studentName, studentClass]);

  // — Filtering by month —
  const filtered = attendanceRecords.filter((rec) => {
    if (!selectedMonth) return true;
    const d = new Date(rec.dayAndDate);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return m === selectedMonth;
  });

  // — Attendance analytics —
  const getTotalDays = () => filtered.length;
  const getTotalHours = () => {
    return filtered
      .reduce((acc, rec) => {
        if (!rec.clockIn || !rec.clockOut) return acc;

        // Parse time formats like "9:30 AM" and "4:00 PM"
        const [inHour, inMinute] = rec.clockIn
          .replace(/\s*(AM|PM)$/i, "")
          .split(":")
          .map(Number);
        const [outHour, outMinute] = rec.clockOut
          .replace(/\s*(AM|PM)$/i, "")
          .split(":")
          .map(Number);

        const inPeriod = rec.clockIn.match(/PM$/i) ? "PM" : "AM";
        const outPeriod = rec.clockOut.match(/PM$/i) ? "PM" : "AM";

        // Convert to 24-hour format
        let startHour = inHour;
        if (inPeriod === "PM" && inHour !== 12) startHour += 12;
        if (inPeriod === "AM" && inHour === 12) startHour = 0;

        let endHour = outHour;
        if (outPeriod === "PM" && outHour !== 12) endHour += 12;
        if (outPeriod === "AM" && outHour === 12) endHour = 0;

        // Calculate duration
        const startMinutes = startHour * 60 + inMinute;
        const endMinutes = endHour * 60 + outMinute;
        const durationHours = (endMinutes - startMinutes) / 60;

        return acc + (durationHours > 0 ? durationHours : 0);
      }, 0)
      .toFixed(1);
  };

  // — Pagination setup —
  const totalPages = Math.ceil(filtered.length / recordsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Format date in a more readable way
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-md max-w-4xl mx-auto p-6 md:p-8"
    >
      <motion.div
        className="flex items-center justify-center gap-3 mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <FaRegCalendarCheck className="text-blue-600 text-2xl" />
        <h2 className="text-2xl font-bold text-gray-800">
          Attendance Dashboard
        </h2>
      </motion.div>

      <AnimatePresence>
        {showStatus && status && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg flex items-center shadow-sm border ${
              status.startsWith("❌")
                ? "bg-red-50 border-red-200 text-red-700"
                : status.startsWith("⚠️")
                ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                : status.startsWith("⏳")
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            <span className="text-lg mr-2">{status.charAt(0)}</span>
            <span>{status.substring(1).trim()}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin/Teacher Controls */}
      {userRole !== "student" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6"
        >
          <motion.h3
            variants={itemVariants}
            className="text-lg font-semibold mb-4 flex items-center text-gray-700"
          >
            <FaUpload className="mr-2 text-indigo-600" />
            Upload Attendance Records
          </motion.h3>

          <motion.div variants={itemVariants} className="space-y-4">
            <div className="relative">
              <input
                id="attendance-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center border-2 border-dashed border-indigo-300 bg-indigo-50 rounded-lg p-4">
                <FaFileExcel className="text-indigo-500 text-xl mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-indigo-700">
                    {file ? file.name : "Select Excel File"}
                  </p>
                  <p className="text-sm text-indigo-600 opacity-70">
                    {file
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : "Click or drag file here"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                onClick={handleUpload}
                className={`${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                } text-white py-3 px-4 rounded-lg shadow transition flex items-center justify-center`}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaUpload className="mr-2" />
                    <span>Process & Upload</span>
                  </>
                )}
              </motion.button>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                onClick={handleSyncStudents}
                className={`${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                } text-white py-3 px-4 rounded-lg shadow transition flex items-center justify-center`}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <FaSync className="mr-2" />
                    <span>Sync Students</span>
                  </>
                )}
              </motion.button>
            </div>

            <motion.div
              variants={itemVariants}
              className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100"
            >
              <p className="font-medium text-blue-700 mb-1">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>
                  Upload Excel file with columns: Name, Class, Clock In, Clock
                  Out, Day and Date
                </li>
                <li>Ensure all required fields are filled correctly</li>
                <li>
                  Use the 'Sync Students' button to sync student database with
                  attendance records
                </li>
              </ol>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Student View */}
      {userRole === "student" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Analytics Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center"
            >
              <div className="bg-blue-500 p-3 rounded-lg mr-3">
                <FaUserCheck className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Total Days Present</p>
                <p className="text-2xl font-bold text-blue-800">
                  {getTotalDays()}
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center"
            >
              <div className="bg-green-500 p-3 rounded-lg mr-3">
                <FaClock className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-green-700">Total Hours</p>
                <p className="text-2xl font-bold text-green-800">
                  {getTotalHours()}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Filter Controls */}
          <motion.div variants={itemVariants}>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
              <h3 className="text-md font-medium text-indigo-800 mb-3 flex items-center">
                <FaFilter className="text-indigo-600 mr-2" /> Filter Attendance
                Records
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-4 py-2 w-full border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedMonth("");
                    setCurrentPage(1);
                  }}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-5 py-2 rounded-lg text-white shadow flex items-center justify-center"
                >
                  <FaTrash className="mr-2" /> Clear Filter
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Attendance Display */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <motion.div
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"
                />
                <span className="ml-3 text-indigo-600 font-medium">
                  Loading records...
                </span>
              </div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center"
              >
                <img
                  src="https://illustrations.popsy.co/amber/hourglass.svg"
                  alt="No records"
                  className="h-32 mx-auto mb-4"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <p className="text-gray-600 font-medium mb-1">
                  No attendance records found
                </p>
                <p className="text-gray-500 text-sm">
                  {selectedMonth
                    ? "Try selecting a different month"
                    : "Your attendance records will appear here"}
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <motion.div
                  className="rounded-lg overflow-hidden border border-gray-200 shadow"
                  whileHover={{
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                          Clock In
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                          Clock Out
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {paginated.map((rec, i) => (
                          <tr
                            key={`${rec.dayAndDate}-${i}`}
                            className={
                              i % 2 === 0
                                ? "bg-gray-50"
                                : "bg-white hover:bg-indigo-50 transition"
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                              {(currentPage - 1) * recordsPerPage + i + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {formatDate(rec.dayAndDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {rec.clockIn}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {rec.clockOut}
                            </td>
                          </tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </motion.div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    variants={itemVariants}
                    className="flex justify-center mt-6"
                  >
                    <div className="inline-flex rounded-md shadow-sm">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-blue-600 hover:bg-blue-50"
                        } border border-gray-300`}
                      >
                        <FaChevronLeft />
                      </motion.button>

                      {Array.from({ length: Math.min(5, totalPages) }).map(
                        (_, idx) => {
                          let pageNumber;

                          // Calculate which page numbers to show
                          if (totalPages <= 5) {
                            pageNumber = idx + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = idx + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + idx;
                          } else {
                            pageNumber = currentPage - 2 + idx;
                          }

                          if (pageNumber > totalPages) return null;

                          return (
                            <motion.button
                              key={idx}
                              whileHover={{
                                scale: currentPage !== pageNumber ? 1.05 : 1,
                              }}
                              whileTap={{
                                scale: currentPage !== pageNumber ? 0.95 : 1,
                              }}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-300 ${
                                currentPage === pageNumber
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-blue-600 hover:bg-blue-50"
                              } ${
                                idx === 0 && currentPage > 3 && totalPages > 5
                                  ? "border-l"
                                  : ""
                              } 
                              ${
                                idx === 4 &&
                                currentPage < totalPages - 2 &&
                                totalPages > 5
                                  ? "border-r"
                                  : ""
                              }`}
                            >
                              {pageNumber}
                            </motion.button>
                          );
                        }
                      )}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-blue-600 hover:bg-blue-50"
                        } border border-gray-300`}
                      >
                        <FaChevronRight />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
