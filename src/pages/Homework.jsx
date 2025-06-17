import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";

const Homework = () => {
  const userRole = localStorage.getItem("userRole");
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  // Fetch classes and batches from Users collection
  useEffect(() => {
    if (userRole === "teacher" || userRole === "admin") {
      setLoading(true);
      getDocs(collection(db, "Users")).then((snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const studentUsers = users.filter((u) => u.role === "student");
        const classSet = new Set();
        studentUsers.forEach((u) => {
          const classVal = u.Class || u.class;
          if (
            classVal &&
            typeof classVal === "string" &&
            classVal.trim() !== ""
          ) {
            classSet.add(classVal.trim());
          }
        });
        setClasses(Array.from(classSet));
        setBatches([]); // Reset batches when class changes
        setLoading(false);
      });
    }
  }, [userRole]);

  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      getDocs(collection(db, "Users")).then((snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const studentUsers = users.filter(
          (u) => u.role === "student" && (u.Class || u.class) === selectedClass
        );
        const batchSet = new Set();
        studentUsers.forEach((u) => {
          const batchVal = u.Batch || u.batch;
          if (
            batchVal &&
            typeof batchVal === "string" &&
            batchVal.trim() !== ""
          ) {
            batchSet.add(batchVal.trim());
          }
        });
        setBatches(Array.from(batchSet));
        setLoading(false);
      });
    } else {
      setBatches([]);
      setStudents([]);
    }
  }, [selectedClass]);

  // Update HomeworkStatus in Firestore
  const handleStatusChange = async (student, status) => {
    setStatusMap((prev) => ({
      ...prev,
      [`${student.id}_${selectedDate}`]: status,
    }));
    const classVal = student.Class || student.class || "";
    const batchVal = student.Batch || student.batch || "";
    const docId = `${student.id}_${selectedDate}`;
    const docRef = doc(db, "HomeworkStatus", docId);
    await setDoc(
      docRef,
      {
        Name: student.name || "",
        Class: classVal,
        Batch: batchVal,
        status,
        date: selectedDate,
      },
      { merge: true }
    );
  };

  // Fetch students for selected class, batch, and date
  useEffect(() => {
    if (selectedClass && selectedBatch && selectedDate) {
      setLoading(true);
      getDocs(collection(db, "Users")).then(async (snapshot) => {
        const users = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(
            (u) =>
              u.role === "student" &&
              (u.Class || u.class) === selectedClass &&
              (u.Batch || u.batch) === selectedBatch
          );
        setStudents(users);
        // Fetch HomeworkStatus for these students for the selected date
        const statusDocs = await getDocs(collection(db, "HomeworkStatus"));
        const statusArr = users.map((u) => {
          const docId = `${u.id}_${selectedDate}`;
          const statusEntry = statusDocs.docs.find((d) => d.id === docId);
          return [docId, statusEntry ? statusEntry.data().status : "Due"];
        });
        setStatusMap(Object.fromEntries(statusArr));
        setLoading(false);
      });
    } else {
      setStudents([]);
    }
  }, [selectedClass, selectedBatch, selectedDate]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6">
          <h2 className="text-2xl font-bold text-white mb-1">Homework</h2>
          <p className="text-blue-100 text-sm">
            View and manage your homework assignments
          </p>
        </div>
        {(userRole === "teacher" || userRole === "admin") && (
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <select
                className="border border-gray-300 rounded-lg px-4 py-2"
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
              <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                disabled={!selectedClass}
              >
                <option value="">Select Batch</option>
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const docId = `${student.id}_${selectedDate}`;
                    return (
                      <tr key={student.id} className="border-b">
                        <td className="px-3 py-2">{student.name}</td>
                        <td className="px-3 py-2">
                          <select
                            className="border border-gray-300 rounded px-2 py-1"
                            value={statusMap[docId] || "Due"}
                            onChange={(e) =>
                              handleStatusChange(student, e.target.value)
                            }
                          >
                            <option value="Due">Due</option>
                            <option value="Submitted">Submitted</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
        {/* ...existing code for student view... */}
      </div>
    </div>
  );
};

export default Homework;
