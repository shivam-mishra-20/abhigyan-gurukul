import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaExclamationCircle,
  FaPlus,
  FaFilter,
  FaTrash,
  FaUserCircle,
  FaSchool,
  FaChalkboardTeacher,
  FaSpinner,
  FaExclamationTriangle,
  FaCheck,
} from "react-icons/fa";

const Complaints = () => {
  const userRole = localStorage.getItem("userRole") || "";
  const userName = localStorage.getItem("studentName") || "";
  const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";

  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentComplaints, setStudentComplaints] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [selectedTab, setSelectedTab] = useState("add");
  const [confirmedDelete, setConfirmedDelete] = useState(null);

  // Fetch all students when component mounts
  useEffect(() => {
    if (!isAdminOrTeacher) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "Users");
        const q = query(usersRef, where("role", "==", "student"));
        const snapshot = await getDocs(q);

        const studentsData = [];
        const uniqueClasses = new Set();

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.name && data.Class) {
            studentsData.push({
              id: doc.id,
              name: data.name,
              class: data.Class,
              batch: data.batch || "General",
            });
            uniqueClasses.add(data.Class);
          }
        });

        setStudents(studentsData);
        setClasses(Array.from(uniqueClasses).sort());
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Failed to load students. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [isAdminOrTeacher]);

  // Filter students when class changes
  useEffect(() => {
    if (selectedClass) {
      const filtered = students.filter(
        (student) => student.class === selectedClass
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
    setSelectedStudent(""); // Reset student selection when class changes
  }, [selectedClass, students]);

  // Modified useEffect to handle JavaScript timestamp conversion when fetching
  useEffect(() => {
    if (!selectedStudent) {
      setStudentComplaints([]);
      return;
    }

    const fetchComplaints = async () => {
      setLoadingComplaints(true);
      try {
        const selectedStudentObj = students.find(
          (s) => s.id === selectedStudent
        );
        if (!selectedStudentObj) return;

        const docId = `${selectedStudentObj.name.replace(
          /\s+/g,
          "_"
        )}_${selectedStudentObj.class.replace(
          /\s+/g,
          "_"
        )}_${selectedStudentObj.batch.replace(/\s+/g, "_")}`;
        const complaintRef = doc(db, "Complaints", docId);
        const complaintDoc = await getDoc(complaintRef);

        if (complaintDoc.exists()) {
          const complaints = complaintDoc.data().complaints || [];

          // Convert numeric timestamps to Date objects for UI display
          const processedComplaints = complaints.map((complaint) => {
            // If timestamp is a number, convert to Date for UI
            if (typeof complaint.timestamp === "number") {
              return {
                ...complaint,
                timestamp: new Date(complaint.timestamp),
              };
            }
            return complaint;
          });

          // Sort by timestamp, newest first
          setStudentComplaints(
            processedComplaints.sort((a, b) => {
              const timeA =
                a.timestamp instanceof Date
                  ? a.timestamp.getTime()
                  : typeof a.timestamp === "number"
                  ? a.timestamp
                  : 0;
              const timeB =
                b.timestamp instanceof Date
                  ? b.timestamp.getTime()
                  : typeof b.timestamp === "number"
                  ? b.timestamp
                  : 0;
              return timeB - timeA;
            })
          );
        } else {
          setStudentComplaints([]);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
        setError("Failed to load complaints. Please try again.");
      } finally {
        setLoadingComplaints(false);
      }
    };

    fetchComplaints();
  }, [selectedStudent, students]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudent || !complaintText) {
      setError("Please select a student and enter a complaint");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const selectedStudentObj = students.find((s) => s.id === selectedStudent);
      if (!selectedStudentObj) throw new Error("Student not found");

      // Create a document ID from student name, class and batch
      const docId = `${selectedStudentObj.name.replace(
        /\s+/g,
        "_"
      )}_${selectedStudentObj.class.replace(
        /\s+/g,
        "_"
      )}_${selectedStudentObj.batch.replace(/\s+/g, "_")}`;
      const complaintRef = doc(db, "Complaints", docId);

      // Check if document already exists
      const complaintDoc = await getDoc(complaintRef);

      // Use a JavaScript Date object instead of serverTimestamp for array items
      const now = new Date();
      const complaintId = now.getTime().toString();

      const newComplaint = {
        text: complaintText,
        severity: selectedSeverity,
        reportedBy: userName,
        // Store date as JavaScript timestamp instead of Firestore serverTimestamp
        timestamp: now.getTime(),
        id: complaintId,
      };

      if (complaintDoc.exists()) {
        // Update existing document
        await updateDoc(complaintRef, {
          complaints: [...(complaintDoc.data().complaints || []), newComplaint],
          lastUpdated: serverTimestamp(), // serverTimestamp is fine at the document root level
        });
      } else {
        // Create new document
        await setDoc(complaintRef, {
          studentName: selectedStudentObj.name,
          class: selectedStudentObj.class,
          batch: selectedStudentObj.batch,
          complaints: [newComplaint],
          createdAt: serverTimestamp(), // serverTimestamp is fine at the document root level
          lastUpdated: serverTimestamp(), // serverTimestamp is fine at the document root level
        });
      }

      // Update local state - add a display-friendly date for immediate UI
      setStudentComplaints((prev) => [
        {
          ...newComplaint,
          // Add a JavaScript Date object for consistent display in the UI
          timestamp: now,
        },
        ...prev,
      ]);

      setComplaintText("");
      setSuccess("Complaint submitted successfully");
      setTimeout(() => setSuccess(""), 3000);

      // Switch to view tab
      setSelectedTab("view");
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setError("Failed to submit complaint: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Format timestamp from numeric timestamp or Date object
  const formatDate = (timestamp) => {
    if (!timestamp) return "Pending...";

    try {
      // Handle different timestamp formats
      let date;
      if (typeof timestamp === "number") {
        date = new Date(timestamp);
      } else if (timestamp.toDate) {
        // Firestore Timestamp object
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return "Invalid date";
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Handle delete complaint
  const handleDeleteComplaint = async (complaintId) => {
    if (confirmedDelete !== complaintId) {
      setConfirmedDelete(complaintId);
      setTimeout(() => setConfirmedDelete(null), 3000);
      return;
    }

    try {
      const selectedStudentObj = students.find((s) => s.id === selectedStudent);
      if (!selectedStudentObj) throw new Error("Student not found");

      const docId = `${selectedStudentObj.name.replace(
        /\s+/g,
        "_"
      )}_${selectedStudentObj.class.replace(
        /\s+/g,
        "_"
      )}_${selectedStudentObj.batch.replace(/\s+/g, "_")}`;
      const complaintRef = doc(db, "Complaints", docId);

      // Remove the complaint from the array
      const updatedComplaints = studentComplaints.filter(
        (complaint) => complaint.id !== complaintId
      );

      await updateDoc(complaintRef, {
        complaints: updatedComplaints.map((complaint) => {
          // Convert any Date objects back to numeric timestamps for storage
          if (complaint.timestamp instanceof Date) {
            return {
              ...complaint,
              timestamp: complaint.timestamp.getTime(),
            };
          }
          return complaint;
        }),
        lastUpdated: serverTimestamp(),
      });

      // Update local state
      setStudentComplaints(updatedComplaints);
      setSuccess("Complaint deleted successfully");
      setConfirmedDelete(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting complaint:", error);
      setError("Failed to delete complaint: " + error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  if (!isAdminOrTeacher) {
    return <StudentComplaintsView userName={userName} />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaExclamationCircle className="mr-2 text-red-500" />
        Student Complaints Management
      </h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 text-sm font-medium flex items-center ${
              selectedTab === "add"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setSelectedTab("add")}
          >
            <FaPlus className="mr-2" /> Add Complaint
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium flex items-center ${
              selectedTab === "view"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setSelectedTab("view")}
          >
            <FaFilter className="mr-2" /> View Complaints
          </button>
        </div>

        <div className="p-6">
          {/* Error and Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded text-red-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded text-green-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Student Selection */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  disabled={!selectedClass || filteredStudents.length === 0}
                >
                  <option value="">
                    {filteredStudents.length === 0 && selectedClass
                      ? "No students found"
                      : "Select Student"}
                  </option>
                  {filteredStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.batch})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedTab === "add" ? (
            /* Add Complaint Form */
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complaint Details
                </label>
                <textarea
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter detailed complaint description..."
                  required
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`px-4 py-2 ${
                    !selectedStudent || !complaintText || submitting
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white rounded-md flex items-center`}
                  disabled={!selectedStudent || !complaintText || submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaExclamationCircle className="mr-2" />
                      Submit Complaint
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* View Complaints Table */
            <div className="overflow-x-auto">
              {loadingComplaints ? (
                <div className="flex justify-center items-center py-8">
                  <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                  <span className="ml-2 text-gray-600">
                    Loading complaints...
                  </span>
                </div>
              ) : !selectedStudent ? (
                <div className="bg-blue-50 p-4 text-blue-700 rounded-lg">
                  <p className="flex items-center">
                    <FaUserCircle className="mr-2" />
                    Please select a class and student to view complaints
                  </p>
                </div>
              ) : studentComplaints.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FaExclamationCircle className="mx-auto text-3xl text-gray-300 mb-2" />
                  <p className="text-gray-500">
                    No complaints found for this student
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Complaint
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reported By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentComplaints.map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(complaint.timestamp)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {complaint.text}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              complaint.severity === "Low"
                                ? "bg-green-100 text-green-800"
                                : complaint.severity === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : complaint.severity === "High"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {complaint.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {complaint.reportedBy || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteComplaint(complaint.id)}
                            className={`text-red-600 hover:text-red-900 flex items-center ${
                              confirmedDelete === complaint.id
                                ? "text-red-800 font-bold"
                                : ""
                            }`}
                          >
                            <FaTrash className="mr-1" />
                            {confirmedDelete === complaint.id
                              ? "Confirm?"
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 rounded-lg p-4 text-blue-800 text-sm mb-6">
        <div className="font-semibold flex items-center mb-2">
          <FaSchool className="mr-2" />
          How to use the Complaints System:
        </div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Select the student's class and name from the dropdown menus</li>
          <li>
            Add a detailed description of the complaint and select severity
          </li>
          <li>
            View all previous complaints for the student in the "View
            Complaints" tab
          </li>
          <li>
            All complaints are permanently recorded unless manually deleted
          </li>
        </ul>
      </div>

      {/* Student View */}
      {!isAdminOrTeacher && userRole === "student" && (
        <StudentComplaintsView userName={userName} />
      )}
    </div>
  );
};

// Component for students to view complaints filed against them
const StudentComplaintsView = ({ userName }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const studentClass = localStorage.getItem("studentClass") || "";
  const studentBatch = localStorage.getItem("studentBatch") || "General";

  useEffect(() => {
    const fetchStudentComplaints = async () => {
      if (!userName || !studentClass) return;

      setLoading(true);
      try {
        console.log(
          "Student view - Fetching complaints for:",
          userName,
          studentClass,
          studentBatch
        );

        // Use same document ID format as in admin view for consistency
        const docId = `${userName.replace(/\s+/g, "_")}_${studentClass.replace(
          /\s+/g,
          "_"
        )}_${studentBatch.replace(/\s+/g, "_")}`;
        const complaintRef = doc(db, "Complaints", docId);
        const complaintDoc = await getDoc(complaintRef);

        if (complaintDoc.exists()) {
          const complaints = complaintDoc.data().complaints || [];
          console.log(
            `Found ${complaints.length} complaints for student ${userName}`
          );

          // Process complaints - same logic as admin view
          const processedComplaints = complaints.map((complaint) => {
            // If timestamp is a number, convert to Date for UI
            if (typeof complaint.timestamp === "number") {
              return {
                ...complaint,
                timestamp: new Date(complaint.timestamp),
              };
            }
            return complaint;
          });

          // Sort by timestamp, newest first - same logic as admin view
          setComplaints(
            processedComplaints.sort((a, b) => {
              const timeA =
                a.timestamp instanceof Date
                  ? a.timestamp.getTime()
                  : typeof a.timestamp === "number"
                  ? a.timestamp
                  : 0;
              const timeB =
                b.timestamp instanceof Date
                  ? b.timestamp.getTime()
                  : typeof b.timestamp === "number"
                  ? b.timestamp
                  : 0;
              return timeB - timeA;
            })
          );
        } else {
          // If the exact document ID isn't found, try a more flexible approach
          console.log("No exact match found for document ID:", docId);

          // Get all complaints
          const complaintsSnapshot = await getDocs(
            collection(db, "Complaints")
          );

          // Look for similar document IDs that might match this student
          let foundDoc = false;
          for (const doc of complaintsSnapshot.docs) {
            const docData = doc.data();

            // Check if studentName matches or is similar
            if (
              docData.studentName &&
              (docData.studentName.toLowerCase() === userName.toLowerCase() ||
                docData.studentName
                  .toLowerCase()
                  .includes(userName.toLowerCase()) ||
                userName
                  .toLowerCase()
                  .includes(docData.studentName.toLowerCase()))
            ) {
              // Check if class matches
              if (docData.class && docData.class.includes(studentClass)) {
                const complaints = docData.complaints || [];
                console.log(
                  `Found ${complaints.length} complaints via flexible matching for ${userName}`
                );

                // Process the complaints the same way
                const processedComplaints = complaints
                  .map((complaint) => {
                    if (typeof complaint.timestamp === "number") {
                      return {
                        ...complaint,
                        timestamp: new Date(complaint.timestamp),
                      };
                    }
                    return complaint;
                  })
                  .sort((a, b) => {
                    const timeA =
                      a.timestamp instanceof Date
                        ? a.timestamp.getTime()
                        : typeof a.timestamp === "number"
                        ? a.timestamp
                        : 0;
                    const timeB =
                      b.timestamp instanceof Date
                        ? b.timestamp.getTime()
                        : typeof b.timestamp === "number"
                        ? b.timestamp
                        : 0;
                    return timeB - timeA;
                  });

                setComplaints(processedComplaints);
                foundDoc = true;
                break;
              }
            }
          }

          if (!foundDoc) {
            console.log(
              "No complaints found for student after flexible search"
            );
            setComplaints([]);
          }
        }
      } catch (error) {
        console.error("Error fetching student complaints:", error);
        setError("Unable to load your complaints. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentComplaints();
  }, [userName, studentClass, studentBatch]);

  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "Pending...";

    try {
      // Handle different timestamp formats
      let date;
      if (typeof timestamp === "number") {
        date = new Date(timestamp);
      } else if (timestamp.toDate) {
        // Firestore Timestamp object
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return "Invalid date";
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Get severity class
  const getSeverityClass = (severity) => {
    switch (severity) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaExclamationCircle className="mr-2 text-red-500" />
        My Complaints
      </h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-red-50 p-4 border-b border-red-200">
          <h2 className="text-lg font-semibold text-red-800">
            Complaints Record
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            This is a record of complaints filed by your teachers. Please take
            appropriate actions to address them.
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <FaSpinner className="animate-spin text-blue-500 text-2xl" />
              <span className="ml-2 text-gray-600">
                Loading your complaints...
              </span>
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                <FaCheck className="text-2xl text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">
                No complaints found
              </h3>
              <p className="text-gray-600">
                You don't have any complaints on record. Keep up the good work!
              </p>
            </div>
          ) : (
            <>
              {/* Show statistics summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-800 font-medium">
                    Total Complaints
                  </div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">
                    {complaints.length}
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-800 font-medium">
                    Medium Severity
                  </div>
                  <div className="text-2xl font-bold text-yellow-900 mt-1">
                    {complaints.filter((c) => c.severity === "Medium").length}
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-800 font-medium">
                    High/Critical
                  </div>
                  <div className="text-2xl font-bold text-red-900 mt-1">
                    {
                      complaints.filter((c) =>
                        ["High", "Critical"].includes(c.severity)
                      ).length
                    }
                  </div>
                </div>
              </div>

              {/* Complaints table for structured view */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Complaint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reported By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(complaint.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {complaint.text}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityClass(
                            complaint.severity
                          )}`}
                        >
                          {complaint.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {complaint.reportedBy || "Teacher"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 text-blue-800 text-sm">
        <div className="font-semibold mb-2 flex items-center">
          <FaSchool className="mr-2" />
          About Your Complaints Record
        </div>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            This page shows all complaints filed by teachers about your conduct
            or academic performance
          </li>
          <li>
            Take these complaints seriously and work on addressing the issues
            mentioned
          </li>
          <li>
            Speak with your teachers if you need clarification or guidance on
            how to improve
          </li>
          <li>
            Regular unaddressed complaints may lead to parental notification or
            further action
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Complaints;
