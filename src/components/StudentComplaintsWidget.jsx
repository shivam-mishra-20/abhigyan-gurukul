import React, { useState, useEffect } from "react";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  FaExclamationCircle,
  FaSpinner,
  FaCheck,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";

const StudentComplaintsWidget = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const studentName = localStorage.getItem("studentName") || "";
  const studentClass = localStorage.getItem("studentClass") || "";
  const studentBatch = localStorage.getItem("studentBatch") || "General";

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!studentName || !studentClass) {
        setLoading(false);
        return;
      }

      try {
        // Using exactly the same fetching logic as in Complaints.jsx
        console.log(
          "Student view - Fetching complaints for:",
          studentName,
          studentClass,
          studentBatch
        );

        // Use same document ID format as in admin view for consistency
        const docId = `${studentName.replace(
          /\s+/g,
          "_"
        )}_${studentClass.replace(/\s+/g, "_")}_${studentBatch.replace(
          /\s+/g,
          "_"
        )}`;
        const complaintRef = doc(db, "Complaints", docId);
        const complaintDoc = await getDoc(complaintRef);

        if (complaintDoc.exists()) {
          const complaints = complaintDoc.data().complaints || [];
          console.log(
            `Found ${complaints.length} complaints for student ${studentName}`
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
          const sortedComplaints = processedComplaints.sort((a, b) => {
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

          // Get only the 3 most recent complaints for the widget
          setComplaints(sortedComplaints.slice(0, 3));
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
              (docData.studentName.toLowerCase() ===
                studentName.toLowerCase() ||
                docData.studentName
                  .toLowerCase()
                  .includes(studentName.toLowerCase()) ||
                studentName
                  .toLowerCase()
                  .includes(docData.studentName.toLowerCase()))
            ) {
              // Check if class matches
              if (docData.class && docData.class.includes(studentClass)) {
                const complaints = docData.complaints || [];
                console.log(
                  `Found ${complaints.length} complaints via flexible matching for ${studentName}`
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

                // Take only the first 3 complaints for the widget
                setComplaints(processedComplaints.slice(0, 3));
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
        setError("Failed to load your complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [studentName, studentClass, studentBatch]);

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "";
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
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
        return "bg-gray-100 text-gray-700";
    }
  };

  // Count high-severity complaints
  const highSeverityCount = complaints.filter(
    (c) => c.severity === "High" || c.severity === "Critical"
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="bg-red-50 border-b border-red-100 p-4">
        <h3 className="font-semibold text-lg text-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <FaExclamationCircle className="mr-2 text-red-500" />
            Complaints
          </div>
          {complaints.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 inline-flex items-center justify-center">
              {complaints.length}
            </span>
          )}
        </h3>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <FaSpinner className="animate-spin text-blue-500 mr-2" />
            <span className="text-gray-600">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm p-2">{error}</div>
        ) : complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="p-2 bg-green-100 rounded-full mb-2">
              <FaCheck className="text-green-600" />
            </div>
            <p className="text-gray-600 text-sm">No complaints on record</p>
          </div>
        ) : (
          <div>
            {highSeverityCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-2 mb-4 text-xs text-red-700 flex items-start">
                <FaExclamationCircle className="mr-1 mt-1 flex-shrink-0" />
                <span>
                  You have {highSeverityCount} high severity{" "}
                  {highSeverityCount === 1 ? "complaint" : "complaints"} that
                  require immediate attention.
                </span>
              </div>
            )}

            <div className="space-y-3">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="border-l-4 pl-3 py-2 border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {complaint.text.length > 70
                        ? complaint.text.substring(0, 70) + "..."
                        : complaint.text}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 ml-2 rounded-full ${getSeverityColor(
                        complaint.severity
                      )}`}
                    >
                      {complaint.severity}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(complaint.timestamp)} • {complaint.reportedBy}
                  </div>
                </div>
              ))}

              <button
                onClick={() => navigate("/student-dashboard/complaints")}
                className="w-full flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 py-2 mt-2"
              >
                View all complaints <FaChevronRight className="ml-1 text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StudentComplaintsWidget;
