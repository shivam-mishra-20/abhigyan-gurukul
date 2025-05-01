import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { motion } from "framer-motion";

const StudentRankings = () => {
  const [rankings, setRankings] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "Results"));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Group results by class and subject
        const groupedRankings = results.reduce((acc, result) => {
          const className = result.class;
          const subject = result.subject;

          if (!acc[className]) {
            acc[className] = {};
          }
          if (!acc[className][subject]) {
            acc[className][subject] = [];
          }

          acc[className][subject].push({
            name: result.name,
            marks: Number(result.marks) || 0,
            outOf: Number(result.outOf) || 0,
            percentage: (
              (Number(result.marks) / Number(result.outOf)) *
              100
            ).toFixed(2),
          });

          // Sort by percentage
          acc[className][subject].sort((a, b) => b.percentage - a.percentage);

          return acc;
        }, {});

        setRankings(groupedRankings);
        setSelectedClass(Object.keys(groupedRankings)[0] || "");
      } catch (error) {
        console.error("Error fetching rankings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const classes = Object.keys(rankings);
  const subjects = selectedClass ? Object.keys(rankings[selectedClass]) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 max-w-7xl mx-auto"
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Student Rankings
        </h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none flex-1"
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none flex-1"
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Rankings Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {selectedClass &&
                selectedSubject &&
                rankings[selectedClass][selectedSubject].map(
                  (student, index) => (
                    <motion.tr
                      key={`${student.name}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {student.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {selectedSubject}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {student.marks}/{student.outOf}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium
                        ${
                          parseFloat(student.percentage) >= 90
                            ? "bg-green-100 text-green-800"
                            : parseFloat(student.percentage) >= 75
                            ? "bg-blue-100 text-blue-800"
                            : parseFloat(student.percentage) >= 60
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                        >
                          {student.percentage}%
                        </span>
                      </td>
                    </motion.tr>
                  )
                )}
            </tbody>
          </table>
        </div>

        {/* No Data Message */}
        {(!selectedClass || !selectedSubject) && (
          <div className="text-center text-gray-500 py-8">
            Please select both class and subject to view rankings
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StudentRankings;
