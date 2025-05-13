import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBook,
  FaCalendarAlt,
  FaClipboardList,
  FaFilter,
  FaSearch,
  FaStar,
  FaUserGraduate,
  FaGraduationCap,
} from "react-icons/fa";

export default function DashboardResult() {
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [outOf, setOutOf] = useState("");
  const [remarks, setRemarks] = useState("");
  const [testDate, setTestDate] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const [studentResults, setStudentResults] = useState([]);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // For Admin/Teacher to view results
  const [selectedViewClass, setSelectedViewClass] = useState("");
  const [selectedViewStudentName, setSelectedViewStudentName] = useState("");
  const [viewedResults, setViewedResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewLoading, setIsViewLoading] = useState(false);

  const role = localStorage.getItem("userRole");
  const currentUserName = localStorage.getItem("studentName");
  const currentUserClass = localStorage.getItem("studentClass");

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
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", damping: 15 },
    },
  };

  const formControlVariants = {
    focus: { scale: 1.02, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" },
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const snapshot = await getDocs(collection(db, "Users"));
        const data = snapshot.docs.map((doc) => doc.data());
        setStudents(data.filter((u) => u.role === "student"));
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (role === "student") {
      const fetchResult = async () => {
        try {
          setIsLoading(true);
          const q = query(
            collection(db, "Results"),
            where("name", "==", currentUserName),
            where("class", "==", currentUserClass)
          );
          const snapshot = await getDocs(q);
          setStudentResults(snapshot.docs.map((doc) => doc.data()));
        } catch (error) {
          console.error("Error fetching results:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchResult();
    }
  }, [role, currentUserName, currentUserClass]);

  const handleSubmit = async () => {
    if (
      !selectedClass ||
      !selectedStudentName ||
      !subject ||
      !marks ||
      !outOf ||
      !testDate
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, "Results"), {
        class: selectedClass,
        name: selectedStudentName,
        subject,
        marks,
        outOf,
        remarks,
        testDate,
        createdAt: new Date().toISOString(),
      });

      setConfirmation("✅ Result submitted successfully!");
      setSubject("");
      setMarks("");
      setOutOf("");
      setRemarks("");
      setTestDate("");

      // Clear confirmation after 3 seconds
      setTimeout(() => {
        setConfirmation("");
      }, 3000);
    } catch (err) {
      console.error("Error submitting result:", err);
      setConfirmation("❌ Failed to submit result.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudentResults = studentResults
    .filter((res) =>
      filterSubject
        ? res.subject?.toLowerCase().includes(filterSubject.toLowerCase())
        : true
    )
    .filter((res) =>
      filterDate
        ? new Date(res.testDate).toISOString().split("T")[0] === filterDate
        : true
    );

  // FIXED: The key issue - separate loading state for view functionality
  const handleViewResults = async () => {
    if (!selectedViewClass || !selectedViewStudentName) {
      alert("Select class and student to view results.");
      return;
    }

    setIsViewLoading(true); // Use separate loading state
    try {
      console.log(
        "Fetching results for:",
        selectedViewStudentName,
        selectedViewClass
      );
      const q = query(
        collection(db, "Results"),
        where("class", "==", selectedViewClass),
        where("name", "==", selectedViewStudentName)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => doc.data());
      console.log("Fetched results:", results);
      setViewedResults(results);
    } catch (err) {
      console.error("Error fetching viewed results:", err);
      alert("Error fetching results: " + err.message);
    } finally {
      setIsViewLoading(false); // Clear view loading state
    }
  };

  const getGradeColor = (marks, outOf) => {
    const percentage = (marks / outOf) * 100;
    if (percentage >= 90) return "bg-green-100 border-green-300 text-green-800";
    if (percentage >= 75) return "bg-teal-100 border-teal-300 text-teal-800";
    if (percentage >= 60) return "bg-blue-100 border-blue-300 text-blue-800";
    if (percentage >= 40)
      return "bg-yellow-100 border-yellow-300 text-yellow-800";
    return "bg-red-100 border-red-300 text-red-800";
  };

  return (
    <motion.div
      className="bg-white p-4 md:p-6 rounded-xl shadow-md max-w-3xl mx-auto border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-2xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <FaClipboardList className="mr-2 text-green-600" />
        {role === "student"
          ? "Your Academic Results"
          : "Manage Student Results"}
      </motion.h2>

      {/* Teacher/Admin Add Result */}
      {(role === "teacher" || role === "admin") && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm"
        >
          <motion.h3
            variants={itemVariants}
            className="text-lg font-semibold mb-4 text-gray-700 flex items-center"
          >
            <FaStar className="text-yellow-500 mr-2" /> Add New Result
          </motion.h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.select
                variants={itemVariants}
                whileFocus={formControlVariants.focus}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="">Select Class</option>
                {[...new Set(students.map((s) => s.Class))].map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </motion.select>

              <motion.select
                variants={itemVariants}
                whileFocus={formControlVariants.focus}
                value={selectedStudentName}
                onChange={(e) => setSelectedStudentName(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="">Select Student</option>
                {students
                  .filter((s) => s.Class === selectedClass)
                  .map((student) => (
                    <option key={student.name} value={student.name}>
                      {student.name}
                    </option>
                  ))}
              </motion.select>

              <motion.div variants={itemVariants} className="relative">
                <FaBook className="absolute left-3 top-3 text-gray-400" />
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="p-2 pl-10 border border-gray-300 rounded-lg w-full appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Subject</option>
                  <option value="English">English</option>
                  <option value="Social Science">SS</option>
                  <option value="Mathematics">Maths</option>
                  <option value="Science">Science</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Language">Hindi</option>
                  <option value="Language">Gujarati</option>
                </select>
              </motion.div>

              <div className="grid grid-cols-2 gap-2">
                <motion.input
                  variants={itemVariants}
                  whileFocus={formControlVariants.focus}
                  type="number"
                  placeholder="Marks"
                  className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                />

                <motion.input
                  variants={itemVariants}
                  whileFocus={formControlVariants.focus}
                  type="number"
                  placeholder="Out Of"
                  className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={outOf}
                  onChange={(e) => setOutOf(e.target.value)}
                />
              </div>

              <motion.input
                variants={itemVariants}
                whileFocus={formControlVariants.focus}
                type="text"
                placeholder="Remarks"
                className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              <motion.div variants={itemVariants} className="relative">
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                <motion.input
                  whileFocus={formControlVariants.focus}
                  type="date"
                  className="p-2 pl-10 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                />
              </motion.div>
            </div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              type="submit"
              className={`${
                isSubmitting
                  ? "bg-gray-400 cursor-wait"
                  : "bg-green-600 hover:bg-green-700"
              } text-white px-6 py-2 rounded-lg shadow-sm hover:shadow transition-all w-full md:w-auto flex items-center justify-center space-x-2`}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Result</span>
              )}
            </motion.button>

            <AnimatePresence>
              {confirmation && (
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`font-medium mt-2 p-2 rounded-lg text-center ${
                    confirmation.includes("❌")
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {confirmation}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      )}

      {/* Student Result View */}
      {role === "student" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-6"
        >
          <motion.div
            variants={itemVariants}
            className="bg-indigo-50 p-4 rounded-lg mb-6 shadow-sm"
          >
            <h3 className="text-lg font-medium text-indigo-800 mb-3 flex items-center">
              <FaFilter className="mr-2" /> Filter Results
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <FaBook className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by Subject"
                  className="border border-indigo-200 p-2 pl-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                />
              </div>
              <div className="relative flex-1">
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  className="border border-indigo-200 p-2 pl-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <motion.div
              className="flex justify-center items-center py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex flex-col items-center">
                <motion.div
                  className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="mt-3 text-indigo-600">Loading results...</p>
              </div>
            </motion.div>
          ) : filteredStudentResults.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200"
            >
              <img
                src="/no-results.svg"
                alt="No results"
                className="h-40 mx-auto opacity-60 mb-4"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <p className="text-gray-500 italic">
                No results found. Try adjusting your filters.
              </p>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="grid gap-4">
              {filteredStudentResults.map((res, idx) => {
                const gradeClass = getGradeColor(res.marks, res.outOf);
                const percentage = ((res.marks / res.outOf) * 100).toFixed(1);

                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{
                      y: -4,
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    className={`p-4 border rounded-lg ${gradeClass} overflow-hidden relative transition-all duration-300`}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
                      className="absolute top-0 left-0 h-1 bg-current opacity-20"
                    />

                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h3 className="text-md font-semibold mb-1 flex items-center">
                          <FaBook className="mr-2" /> {res.subject}
                        </h3>
                        <p className="text-sm">
                          <strong>Date:</strong>{" "}
                          {new Date(res.testDate).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="mt-2 md:mt-0 flex flex-col items-end">
                        <div className="flex items-center">
                          <strong className="mr-1">Marks:</strong>
                          <span className="text-lg font-bold">
                            {res.marks} / {res.outOf}
                          </span>
                          <span className="ml-2 text-xs px-2 py-1 rounded-full bg-white bg-opacity-60">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {res.remarks && (
                      <p className="text-sm mt-2 border-t pt-2 border-opacity-30">
                        <strong>Remarks:</strong> {res.remarks}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Admin/Teacher View Any Student's Results */}
      {(role === "teacher" || role === "admin") && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-10 border-t pt-6"
        >
          <motion.h3
            variants={itemVariants}
            className="text-lg font-semibold mb-4 text-gray-700 flex items-center"
          >
            <FaSearch className="text-blue-500 mr-2" /> View Student Results
          </motion.h3>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
          >
            <div className="relative">
              <FaUserGraduate className="absolute left-3 top-3 text-gray-400" />
              <select
                value={selectedViewClass}
                onChange={(e) => setSelectedViewClass(e.target.value)}
                className="p-2 pl-10 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Class</option>
                {[...new Set(students.map((s) => s.Class))].map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <FaUserGraduate className="absolute left-3 top-3 text-gray-400" />
              <select
                value={selectedViewStudentName}
                onChange={(e) => setSelectedViewStudentName(e.target.value)}
                className="p-2 pl-10 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Student</option>
                {students
                  .filter((s) => s.Class === selectedViewClass)
                  .map((student) => (
                    <option key={student.name} value={student.name}>
                      {student.name}
                    </option>
                  ))}
              </select>
            </div>
          </motion.div>

          {/* FIXED: Use separate loading state for view functionality */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewResults}
            disabled={isViewLoading}
            className={`${
              isViewLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            } text-white px-6 py-3 rounded-lg shadow transition-all duration-200 font-medium flex items-center justify-center w-full md:w-auto`}
          >
            {isViewLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <FaSearch className="mr-2" /> View Results
              </>
            )}
          </motion.button>

          {/* Debug info */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-2 text-xs text-gray-500">
              <div>Selected Class: {selectedViewClass || "None"}</div>
              <div>Selected Student: {selectedViewStudentName || "None"}</div>
              <div>Results count: {viewedResults.length}</div>
            </div>
          )}

          {/* FIXED: Results display - we manually control rendering instead of using AnimatePresence */}
          {viewedResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-6 overflow-hidden"
            >
              <motion.div
                variants={itemVariants}
                className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium text-blue-800 flex items-center">
                    <FaGraduationCap className="mr-2" />
                    {selectedViewStudentName}
                  </h4>
                  <p className="text-sm text-blue-600 mt-0.5">
                    Class: {selectedViewClass}
                  </p>
                </div>
                <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 text-sm font-medium">
                  {viewedResults.length} Result
                  {viewedResults.length !== 1 ? "s" : ""}
                </div>
              </motion.div>

              <div className="grid gap-4">
                {viewedResults.map((res, idx) => {
                  const gradeClass = getGradeColor(res.marks, res.outOf);
                  const percentage = ((res.marks / res.outOf) * 100).toFixed(1);

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{
                        y: -4,
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                      className={`p-4 border rounded-lg ${gradeClass} overflow-hidden relative transition-all duration-300`}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="absolute top-0 left-0 h-1 bg-current opacity-30"
                      />

                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1 flex items-center">
                            <FaBook className="mr-2" />
                            {res.subject}
                          </h3>
                          <p className="text-sm flex items-center">
                            <FaCalendarAlt className="mr-1 opacity-70" />
                            <span className="opacity-80">
                              {new Date(res.testDate).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </p>
                        </div>

                        <div className="mt-2 md:mt-0">
                          <div className="flex items-center">
                            <span className="text-xl font-bold">
                              {res.marks} / {res.outOf}
                            </span>
                            <span className="ml-2 text-xs bg-white bg-opacity-50 px-2 py-0.5 rounded-full">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {res.remarks && (
                        <p className="text-sm mt-2 pt-2 border-t border-current border-opacity-20">
                          <strong>Remarks:</strong> {res.remarks}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* No results message */}
          {viewedResults.length === 0 &&
            selectedViewClass &&
            selectedViewStudentName &&
            !isViewLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-center"
              >
                No results found for this student.
              </motion.div>
            )}
        </motion.div>
      )}
    </motion.div>
  );
}
