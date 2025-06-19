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
  const [studentSelectedDate, setStudentSelectedDate] = useState("");

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

  // Student view: fetch homework status for current and previous dates
  const [studentStatusList, setStudentStatusList] = useState([]);
  useEffect(() => {
    if (userRole === "student") {
      // Use the same doc id logic as teacher/admin side
      const userName = (
        localStorage.getItem("studentName") ||
        localStorage.getItem("name") ||
        ""
      ).replace(/\s/g, "_");
      const userClass =
        localStorage.getItem("Class") || localStorage.getItem("class") || "";
      const studentId =
        localStorage.getItem("studentId") || localStorage.getItem("uid") || "";
      const today = new Date().toISOString().split("T")[0];
      getDocs(collection(db, "HomeworkStatus")).then((snapshot) => {
        const today = new Date().toISOString().split("T")[0];
        const allDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("[DEBUG] All HomeworkStatus docs:", allDocs);
        const statusArr = allDocs
          .filter((doc) => {
            const docIdParts = doc.id.split("_");
            const docDate =
              doc.date ||
              (docIdParts.length > 2
                ? docIdParts[docIdParts.length - 1]
                : null);
            // Match by studentId or userName (with underscores)
            const matchesId = studentId && doc.id.startsWith(studentId);
            const matchesName = userName && doc.id.startsWith(userName);
            // If a date is present, check it's not in the future
            const dateOk = !docDate || docDate <= today;
            const match = (matchesId || matchesName) && dateOk;
            if (match) {
              console.log("[DEBUG] Matched doc:", doc);
            }
            return match;
          })
          .sort((a, b) => {
            const dateA =
              a.date ||
              (a.id.split("_").length > 2 ? a.id.split("_").slice(-1)[0] : "");
            const dateB =
              b.date ||
              (b.id.split("_").length > 2 ? b.id.split("_").slice(-1)[0] : "");
            return dateB.localeCompare(dateA);
          });
        console.log("[DEBUG] Filtered statusArr:", statusArr);
        setStudentStatusList(statusArr);
      });
    }
  }, [userRole]);

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
        {userRole === "student" && (
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4 text-blue-700">
              Your Homework Status
            </h3>
            <div className="mb-4">
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={studentSelectedDate}
                onChange={(e) => setStudentSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-blue-100">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {studentStatusList.filter(
                  (status) =>
                    !studentSelectedDate ||
                    status.date === studentSelectedDate ||
                    status.id.endsWith(`_${studentSelectedDate}`)
                ).length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center py-4">
                      No homework records found.
                    </td>
                  </tr>
                )}
                {studentStatusList
                  .filter(
                    (status) =>
                      !studentSelectedDate ||
                      status.date === studentSelectedDate ||
                      status.id.endsWith(`_${studentSelectedDate}`)
                  )
                  .map((status) => (
                    <tr key={status.id} className="border-b">
                      <td className="px-3 py-2">
                        {status.date || status.id.split("_").slice(-1)[0]}
                      </td>
                      <td className="px-3 py-2">{status.status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homework;
