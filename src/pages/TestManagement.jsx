import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { logEvent } from "../utils/logEvent";

const TestManagement = () => {
  const userRole = localStorage.getItem("userRole");
  // Past Tests State
  const [pastTests, setPastTests] = useState([]);
  const [newPastTest, setNewPastTest] = useState({
    testName: "",
    class: "",
    batch: "",
    subject: "",
    date: "",
    maxMarks: "",
    studentResults: [],
  });
  // Upcoming Tests State
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [newUpcomingTest, setNewUpcomingTest] = useState({
    testName: "",
    class: "",
    batch: "",
    subject: "",
    scheduledDate: "",
    maxMarks: "",
    instructions: "",
  });
  const [showPastTests, setShowPastTests] = useState(false);

  // Pagination for upcoming tests
  const [upcomingPage, setUpcomingPage] = useState(1);
  const testsPerPage = 6;
  const paginatedUpcoming = upcomingTests.slice(
    (upcomingPage - 1) * testsPerPage,
    upcomingPage * testsPerPage
  );
  const totalUpcomingPages = Math.ceil(upcomingTests.length / testsPerPage);

  // Default date for new tests
  const todayStr = new Date().toISOString().split("T")[0];

  // Dropdown options
  const subjectOptions = [
    "Mathematics",
    "Science",
    "English",
    "Physics",
    "Chemistry",
    "Biology",
    "Hindi",
    "Gujarati",
    "Sanskrit",
    "Social Science",
  ];
  const classOptions = [
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
  ];
  const batchOptions = ["Lakshya", "Aadharshila", "Batch"];

  // Fetch Past Tests
  useEffect(() => {
    getDocs(collection(db, "PastTests")).then((snapshot) => {
      setPastTests(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    getDocs(collection(db, "UpcomingTests")).then((snapshot) => {
      setUpcomingTests(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
  }, []);

  // Add Past Test
  const handleAddPastTest = async () => {
    await addDoc(collection(db, "PastTests"), {
      ...newPastTest,
      createdBy: localStorage.getItem("userId"),
    });
    setNewPastTest({
      testName: "",
      class: "",
      batch: "",
      subject: "",
      date: "",
      maxMarks: "",
      studentResults: [],
    });
    const snapshot = await getDocs(collection(db, "PastTests"));
    setPastTests(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    await logEvent(`Past test added: ${newPastTest.testName}`);
  };

  // Add Upcoming Test
  const handleAddUpcomingTest = async () => {
    await addDoc(collection(db, "UpcomingTests"), {
      ...newUpcomingTest,
      createdBy: localStorage.getItem("userId"),
    });
    setNewUpcomingTest({
      testName: "",
      class: "",
      batch: "",
      subject: "",
      scheduledDate: "",
      maxMarks: "",
      instructions: "",
    });
    const snapshot = await getDocs(collection(db, "UpcomingTests"));
    setUpcomingTests(
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  };

  // Delete Past Test
  const handleDeletePastTest = async (id) => {
    await deleteDoc(doc(db, "PastTests", id));
    setPastTests(pastTests.filter((t) => t.id !== id));
  };

  // Delete Upcoming Test
  const handleDeleteUpcomingTest = async (id) => {
    await deleteDoc(doc(db, "UpcomingTests", id));
    setUpcomingTests(upcomingTests.filter((t) => t.id !== id));
  };

  const [completingTestId, setCompletingTestId] = useState(null);
  const [invigilator, setInvigilator] = useState("");
  const [classRoomNo, setClassRoomNo] = useState("");
  const invigilatorOptions = [
    "Dhara Ma'am",
    "Pratyaksha Ma'am",
    "Sonia Ma'am",
    "Preeti Ma'am",
    "Nitesh Sir",
    "Nitish Sir",
    "Abhigyan Sir",
    "Chandan Sir",
    "Shivam Sir",
    "Prakash Sir",
    "Ankit Sir",
    "Kedar Sir",
    "Sarman Sir",
    "Kiran Sir",
  ];

  const handleCompleteTest = async (test) => {
    if (!invigilator || !classRoomNo) return;
    // Add to PastTests
    await addDoc(collection(db, "PastTests"), {
      ...test,
      invigilator,
      classRoomNo,
      date: test.scheduledDate || todayStr,
      completedAt: new Date().toISOString(),
    });
    // Remove from UpcomingTests
    await deleteDoc(doc(db, "UpcomingTests", test.id));
    setUpcomingTests(upcomingTests.filter((t) => t.id !== test.id));
    setCompletingTestId(null);
    setInvigilator("");
    setClassRoomNo("");
    // Refresh past tests
    const snapshot = await getDocs(collection(db, "PastTests"));
    setPastTests(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  if (!(userRole === "teacher" || userRole === "admin")) {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        Access Denied
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white mb-1">
            Test Management
          </h2>
          <p className="text-purple-100 text-sm">
            Create, manage, and review tests. (Admins & Teachers only)
          </p>
        </div>
        <div className="p-6">
          {/* Record Past Tests */}
          <h3 className="text-lg font-bold mb-2 text-purple-700">
            Record Past Test
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              className="border rounded px-2 py-1"
              placeholder="Test Name"
              value={newPastTest.testName}
              onChange={(e) =>
                setNewPastTest({ ...newPastTest, testName: e.target.value })
              }
            />
            <select
              className="border rounded px-2 py-1"
              value={newPastTest.class}
              onChange={(e) =>
                setNewPastTest({ ...newPastTest, class: e.target.value })
              }
            >
              <option value="">Select Class</option>
              {classOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-1"
              value={newPastTest.batch}
              onChange={(e) =>
                setNewPastTest({ ...newPastTest, batch: e.target.value })
              }
            >
              <option value="">Select Batch</option>
              {batchOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-1"
              value={newPastTest.subject}
              onChange={(e) =>
                setNewPastTest({ ...newPastTest, subject: e.target.value })
              }
            >
              <option value="">Select Subject</option>
              {subjectOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <input
              className="border rounded px-2 py-1"
              placeholder="Topic"
              value={newPastTest.topic || ""}
              onChange={(e) =>
                setNewPastTest({ ...newPastTest, topic: e.target.value })
              }
            />
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={newPastTest.date || todayStr}
              onChange={(e) =>
                setNewPastTest({ ...newPastTest, date: e.target.value })
              }
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="Max Marks"
              value={newPastTest.maxMarks}
              onChange={(e) =>
                setNewPastTest({ ...newPastTest, maxMarks: e.target.value })
              }
            />
            {/* Student results can be added as a future enhancement */}
            <button
              className="bg-purple-600 text-white px-4 py-1 rounded"
              onClick={handleAddPastTest}
            >
              Add
            </button>
          </div>
          <button
            className={`mb-6 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              showPastTests
                ? "bg-purple-600 text-white"
                : "bg-purple-50 text-purple-600 hover:bg-purple-100"
            }`}
            onClick={() => setShowPastTests((v) => !v)}
          >
            {showPastTests ? "Hide Past Tests" : "View Past Tests"}
          </button>
          {showPastTests && (
            <table className="min-w-full text-sm mb-8">
              <thead>
                <tr className="bg-purple-100">
                  <th className="px-3 py-2">Test Name</th>
                  <th>Class</th>
                  <th>Batch</th>
                  <th>Subject</th>
                  <th>Topic</th>
                  <th>Date</th>
                  <th>Max Marks</th>
                  <th>Invigilator</th>
                  <th>Class Room No</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pastTests.map((test) => (
                  <tr key={test.id} className="border-b">
                    <td className="px-3 py-2">{test.testName}</td>
                    <td>{test.class}</td>
                    <td>{test.batch}</td>
                    <td>{test.subject}</td>
                    <td>{test.topic}</td>
                    <td>{test.date}</td>
                    <td>{test.maxMarks}</td>
                    <td>{test.invigilator || "-"}</td>
                    <td>{test.classRoomNo || "-"}</td>
                    <td>
                      <button
                        className="text-red-500"
                        onClick={() => handleDeletePastTest(test.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Schedule Upcoming Tests */}
          <h3 className="text-lg font-bold mb-2 text-purple-700">
            Schedule Upcoming Test
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              className="border rounded px-2 py-1"
              placeholder="Test Name"
              value={newUpcomingTest.testName}
              onChange={(e) =>
                setNewUpcomingTest({
                  ...newUpcomingTest,
                  testName: e.target.value,
                })
              }
            />
            <select
              className="border rounded px-2 py-1"
              value={newUpcomingTest.class}
              onChange={(e) =>
                setNewUpcomingTest({
                  ...newUpcomingTest,
                  class: e.target.value,
                })
              }
            >
              <option value="">Select Class</option>
              {classOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-1"
              value={newUpcomingTest.batch}
              onChange={(e) =>
                setNewUpcomingTest({
                  ...newUpcomingTest,
                  batch: e.target.value,
                })
              }
            >
              <option value="">Select Batch</option>
              {batchOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-1"
              value={newUpcomingTest.subject}
              onChange={(e) =>
                setNewUpcomingTest({
                  ...newUpcomingTest,
                  subject: e.target.value,
                })
              }
            >
              <option value="">Select Subject</option>
              {subjectOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <input
              className="border rounded px-2 py-1"
              placeholder="Topic"
              value={newUpcomingTest.topic || ""}
              onChange={(e) =>
                setNewUpcomingTest({
                  ...newUpcomingTest,
                  topic: e.target.value,
                })
              }
            />
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={newUpcomingTest.scheduledDate || todayStr}
              onChange={(e) =>
                setNewUpcomingTest({
                  ...newUpcomingTest,
                  scheduledDate: e.target.value,
                })
              }
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="Max Marks"
              value={newUpcomingTest.maxMarks}
              onChange={(e) =>
                setNewUpcomingTest({
                  ...newUpcomingTest,
                  maxMarks: e.target.value,
                })
              }
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="Instructions"
              value={newUpcomingTest.instructions}
              onChange={(e) =>
                setNewUpcomingTest({
                  ...newUpcomingTest,
                  instructions: e.target.value,
                })
              }
            />
            <button
              className="bg-purple-600 text-white px-4 py-1 rounded"
              onClick={handleAddUpcomingTest}
            >
              Add
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedUpcoming.map((test, idx) => (
              <div
                key={test.id}
                className={`bg-purple-50 border border-purple-200 rounded-xl shadow p-4 flex flex-col mb-4 ${
                  idx < 3 ? "md:row-start-1" : "md:row-start-2"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-purple-700 text-lg">
                    {test.testName}
                  </span>
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                    {test.scheduledDate}
                  </span>
                </div>
                <div className="mb-1 text-sm text-gray-700">
                  Class: <span className="font-semibold">{test.class}</span>
                </div>
                <div className="mb-1 text-sm text-gray-700">
                  Batch: <span className="font-semibold">{test.batch}</span>
                </div>
                <div className="mb-1 text-sm text-gray-700">
                  Subject: <span className="font-semibold">{test.subject}</span>
                </div>
                <div className="mb-1 text-sm text-gray-700">
                  Topic: <span className="font-semibold">{test.topic}</span>
                </div>
                <div className="mb-1 text-sm text-gray-700">
                  Max Marks:{" "}
                  <span className="font-semibold">{test.maxMarks}</span>
                </div>
                <div className="mb-2 text-sm text-gray-700">
                  Instructions:{" "}
                  <span className="font-normal">{test.instructions}</span>
                </div>
                {completingTestId === test.id ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <select
                      className="border rounded px-2 py-1"
                      value={invigilator}
                      onChange={(e) => setInvigilator(e.target.value)}
                    >
                      <option value="">Select Invigilator</option>
                      {invigilatorOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <input
                      className="border rounded px-2 py-1"
                      placeholder="Class Room No"
                      value={classRoomNo}
                      onChange={(e) => setClassRoomNo(e.target.value)}
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded"
                        onClick={() => handleCompleteTest(test)}
                        disabled={!invigilator || !classRoomNo}
                      >
                        Confirm Complete
                      </button>
                      <button
                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
                        onClick={() => {
                          setCompletingTestId(null);
                          setInvigilator("");
                          setClassRoomNo("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="self-end text-xs text-green-600 mt-2 border border-green-600 px-2 py-1 rounded"
                    onClick={() => setCompletingTestId(test.id)}
                  >
                    Test Complete
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          {totalUpcomingPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="px-3 py-1 rounded bg-purple-200 text-purple-800 disabled:opacity-50"
                onClick={() => setUpcomingPage((up) => Math.max(1, up - 1))}
                disabled={upcomingPage === 1}
              >
                Prev
              </button>
              <span className="px-2 py-1">
                Page {upcomingPage} of {totalUpcomingPages}
              </span>
              <button
                className="px-3 py-1 rounded bg-purple-200 text-purple-800 disabled:opacity-50"
                onClick={() =>
                  setUpcomingPage((up) => Math.min(totalUpcomingPages, up + 1))
                }
                disabled={upcomingPage === totalUpcomingPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestManagement;
