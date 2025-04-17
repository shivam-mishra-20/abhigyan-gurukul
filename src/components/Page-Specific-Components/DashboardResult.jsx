import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";

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

  const role = localStorage.getItem("userRole");
  const currentUserName = localStorage.getItem("studentName");
  const currentUserClass = localStorage.getItem("studentClass");

  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, "Users"));
      const data = snapshot.docs.map((doc) => doc.data());
      setStudents(data.filter((u) => u.role === "student"));
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (role === "student") {
      const fetchResult = async () => {
        const q = query(
          collection(db, "Results"),
          where("name", "==", currentUserName),
          where("class", "==", currentUserClass)
        );
        const snapshot = await getDocs(q);
        setStudentResults(snapshot.docs.map((doc) => doc.data()));
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
    } catch (err) {
      console.error("Error submitting result:", err);
      setConfirmation("❌ Failed to submit result.");
    }
  };

  const filteredStudentResults = studentResults
    .filter((res) =>
      filterSubject
        ? res.subject?.toLowerCase() === filterSubject.toLowerCase()
        : true
    )
    .filter((res) =>
      filterDate
        ? new Date(res.testDate).toISOString().split("T")[0] === filterDate
        : true
    );

  const handleViewResults = async () => {
    if (!selectedViewClass || !selectedViewStudentName) {
      alert("Select class and student to view results.");
      return;
    }

    try {
      const q = query(
        collection(db, "Results"),
        where("class", "==", selectedViewClass),
        where("name", "==", selectedViewStudentName)
      );
      const snapshot = await getDocs(q);
      setViewedResults(snapshot.docs.map((doc) => doc.data()));
    } catch (err) {
      console.error("Error fetching viewed results:", err);
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        {role === "student" ? "Your Results" : "Add Student Result"}
      </h2>

      {/* Teacher/Admin Add Result */}
      {(role === "teacher" || role === "admin") && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="p-2 border rounded w-full"
            >
              <option value="">Select Class</option>
              {[...new Set(students.map((s) => s.Class))].map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <select
              value={selectedStudentName}
              onChange={(e) => setSelectedStudentName(e.target.value)}
              className="p-2 border rounded w-full"
            >
              <option value="">Select Student</option>
              {students
                .filter((s) => s.Class === selectedClass)
                .map((student) => (
                  <option key={student.name} value={student.name}>
                    {student.name}
                  </option>
                ))}
            </select>

            <input
              type="text"
              placeholder="Subject"
              className="p-2 border rounded w-full"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <input
              type="number"
              placeholder="Marks"
              className="p-2 border rounded w-full"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
            />

            <input
              type="number"
              placeholder="Out Of"
              className="p-2 border rounded w-full"
              value={outOf}
              onChange={(e) => setOutOf(e.target.value)}
            />

            <input
              type="text"
              placeholder="Remarks"
              className="p-2 border rounded w-full"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <input
              type="date"
              className="p-2 border rounded w-full"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full md:w-auto"
          >
            Submit
          </button>

          {confirmation && (
            <p className="text-green-600 font-semibold mt-2">{confirmation}</p>
          )}
        </form>
      )}

      {/* Student Result View */}
      {role === "student" && (
        <div className="mt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Filter by Subject"
              className="border p-2 rounded w-full"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            />
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          {filteredStudentResults.length === 0 ? (
            <p className="text-center text-gray-500 italic">
              No results found.
            </p>
          ) : (
            <div className="grid gap-4">
              {filteredStudentResults.map((res, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 border rounded shadow-sm"
                >
                  <h3 className="text-md font-semibold mb-1 text-blue-600">
                    {res.subject}
                  </h3>
                  <p className="text-sm">
                    <strong>Marks:</strong> {res.marks} / {res.outOf}
                  </p>
                  <p className="text-sm">
                    <strong>Date:</strong>{" "}
                    {new Date(res.testDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <strong>Remarks:</strong> {res.remarks || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin/Teacher View Any Student's Results */}
      {(role === "teacher" || role === "admin") && (
        <div className="mt-10 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">
            📄 View Student Results
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              value={selectedViewClass}
              onChange={(e) => setSelectedViewClass(e.target.value)}
              className="p-2 border rounded w-full"
            >
              <option value="">Select Class</option>
              {[...new Set(students.map((s) => s.Class))].map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            <select
              value={selectedViewStudentName}
              onChange={(e) => setSelectedViewStudentName(e.target.value)}
              className="p-2 border rounded w-full"
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

          <button
            onClick={handleViewResults}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View Results
          </button>

          {viewedResults.length > 0 && (
            <div className="mt-6 grid gap-4">
              {viewedResults.map((res, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 border rounded shadow-sm"
                >
                  <h3 className="text-md font-semibold mb-1 text-purple-600">
                    {res.subject}
                  </h3>
                  <p className="text-sm">
                    <strong>Marks:</strong> {res.marks} / {res.outOf}
                  </p>
                  <p className="text-sm">
                    <strong>Date:</strong>{" "}
                    {new Date(res.testDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <strong>Remarks:</strong> {res.remarks || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
