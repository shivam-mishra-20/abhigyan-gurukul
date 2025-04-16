import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function DashboardResult() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [result, setResult] = useState("");
  const [remark, setRemark] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [studentData, setStudentData] = useState(null);

  const role = localStorage.getItem("userRole");
  const currentUserId = localStorage.getItem("userId");

  // Fetch all students
  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, "students"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
    };
    fetchStudents();
  }, []);

  // Filter students based on selected class
  useEffect(() => {
    const filtered = students.filter((student) =>
      selectedClass ? student.Class === selectedClass : false
    );
    setFilteredStudents(filtered);
    setSelectedStudentId(""); // reset on class change
  }, [students, selectedClass]);

  // Fetch result if role is student
  useEffect(() => {
    if (role === "student" && currentUserId) {
      const fetchStudent = async () => {
        const studentRef = doc(db, "students", currentUserId);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          setStudentData(studentSnap.data());
        }
      };
      fetchStudent();
    }
  }, [role, currentUserId]);

  const handleSubmit = async () => {
    const selectedStudent = filteredStudents.find(
      (s) => s.id === selectedStudentId
    );

    if (!selectedStudent || result.trim() === "") {
      alert("Please select a student and enter a result.");
      return;
    }

    try {
      const studentRef = doc(db, "students", selectedStudent.id);
      await updateDoc(studentRef, {
        result: result.trim(),
        remark: remark.trim(),
      });

      setConfirmation(`✅ Result updated for ${selectedStudent.name}`);
      setResult("");
      setRemark("");
    } catch (error) {
      console.error("Error updating result:", error);
      setConfirmation("❌ Failed to update result.");
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Add Student Result</h2>

      {(role === "teacher" || role === "admin") && (
        <>
          <div className="flex flex-col gap-3 mb-4">
            <label className="text-sm font-medium">Select Class</label>
            <select
              className="border p-2 rounded"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">-- Choose Class --</option>
              {[...new Set(students.map((s) => s.Class))].map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            {selectedClass && (
              <>
                <label className="text-sm font-medium">Select Student</label>
                <select
                  className="border p-2 rounded"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  <option value="">-- Choose Student --</option>
                  {filteredStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          {selectedStudentId && (
            <div className="flex flex-col gap-3 mb-4">
              <label className="text-sm font-medium">Result</label>
              <input
                type="text"
                className="border p-2 rounded"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="e.g., Passed, 85%, etc."
              />

              <label className="text-sm font-medium">Remark</label>
              <textarea
                className="border p-2 rounded"
                rows={3}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Add any remarks"
              />
            </div>
          )}

          {confirmation && (
            <p className="text-green-600 text-sm font-semibold mb-2">
              {confirmation}
            </p>
          )}

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Submit Result
          </button>
        </>
      )}

      {role === "student" && studentData && (
        <div className="text-center mt-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">
            Your Result:
          </h3>

          {studentData.result ? (
            <>
              <p className="text-md mb-1">
                <strong>Result:</strong> {studentData.result}
              </p>
              <p className="text-md">
                <strong>Remark:</strong>{" "}
                {studentData.remark?.trim() ? studentData.remark : "No remarks"}
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-md italic">
              Result not declared yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
