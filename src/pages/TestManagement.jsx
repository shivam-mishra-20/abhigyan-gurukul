import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const TestManagement = () => {
  const userRole = localStorage.getItem("userRole");

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Past Tests State
  const [pastTests, setPastTests] = useState([]);
  const [newPastTest, setNewPastTest] = useState({
    testName: "",
    class: "",
    batch: "",
    subject: "",
    date: "",
    maxMarks: "",
    duration: "",
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
    duration: "",
    instructions: "",
  });

  const [showPastTests, setShowPastTests] = useState(false);

  // Confirmation state for delete operations
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'past' or 'upcoming'

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
    setIsLoading(true);
    Promise.all([
      getDocs(collection(db, "PastTests")),
      getDocs(collection(db, "UpcomingTests")),
    ])
      .then(([pastSnap, upcomingSnap]) => {
        setPastTests(
          pastSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setUpcomingTests(
          upcomingSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tests:", error);
        setIsLoading(false);
      });
  }, []);

  // Toast Notification System
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const Toasts = () => (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded shadow-lg text-white font-medium transition-all duration-300 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
          style={{ minWidth: 220 }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );

  // Add Past Test
  const handleAddPastTest = async () => {
    try {
      setIsLoading(true);
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
        duration: "",
        studentResults: [],
      });
      const snapshot = await getDocs(collection(db, "PastTests"));
      setPastTests(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      showToast("Past test added successfully.");
    } catch {
      showToast("Failed to add past test.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Add Upcoming Test
  const handleAddUpcomingTest = async () => {
    try {
      setIsLoading(true);
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
        duration: "",
        instructions: "",
      });
      const snapshot = await getDocs(collection(db, "UpcomingTests"));
      setUpcomingTests(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      showToast("Upcoming test scheduled successfully.");
    } catch {
      showToast("Failed to schedule upcoming test.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Past Test with confirmation
  const confirmDeletePastTest = (id) => {
    setDeleteConfirmId(id);
    setDeleteType("past");
  };

  // Delete Upcoming Test with confirmation
  const confirmDeleteUpcomingTest = (id) => {
    setDeleteConfirmId(id);
    setDeleteType("upcoming");
  };

  // Execute delete after confirmation
  const executeDelete = async () => {
    try {
      setIsLoading(true);
      if (deleteType === "past" && deleteConfirmId) {
        await deleteDoc(doc(db, "PastTests", deleteConfirmId));
        setPastTests(pastTests.filter((t) => t.id !== deleteConfirmId));
        showToast("Past test deleted.");
      } else if (deleteType === "upcoming" && deleteConfirmId) {
        await deleteDoc(doc(db, "UpcomingTests", deleteConfirmId));
        setUpcomingTests(upcomingTests.filter((t) => t.id !== deleteConfirmId));
        showToast("Upcoming test deleted.");
      }
    } catch (error) {
      console.error("Error deleting test:", error);
    } finally {
      setDeleteConfirmId(null);
      setDeleteType(null);
      setIsLoading(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmId(null);
    setDeleteType(null);
  };

  // Completing test logic
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

    try {
      setIsLoading(true);
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
      // Reset state
      setCompletingTestId(null);
      setInvigilator("");
      setClassRoomNo("");
      // Refresh past tests
      const snapshot = await getDocs(collection(db, "PastTests"));
      setPastTests(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error completing test:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit functionality
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTest, setEditTest] = useState(null);
  const [editType, setEditType] = useState(null); // 'past' or 'upcoming'
  const [editForm, setEditForm] = useState({});

  const openEditModal = (test, type) => {
    setEditType(type);
    setEditTest(test);
    setEditForm({ ...test });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditTest(null);
    setEditType(null);
    setEditForm({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editTest || !editType) return;
    const docRef = doc(
      db,
      editType === "past" ? "PastTests" : "UpcomingTests",
      editTest.id
    );
    try {
      await updateDoc(docRef, editForm);
      closeEditModal();
      // Refresh data
      if (editType === "past") {
        const snapshot = await getDocs(collection(db, "PastTests"));
        setPastTests(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } else {
        const snapshot = await getDocs(collection(db, "UpcomingTests"));
        setUpcomingTests(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
      showToast("Test updated successfully.");
    } catch {
      showToast("Failed to update test.", "error");
    }
  };

  const handleDeletePastTest = async (id) => {
    try {
      await deleteDoc(doc(db, "PastTests", id));
      setPastTests((prev) => prev.filter((t) => t.id !== id));
      showToast("Past test deleted.");
    } catch {
      showToast("Failed to delete past test.", "error");
    }
  };

  const handleDeleteUpcomingTest = async (id) => {
    try {
      await deleteDoc(doc(db, "UpcomingTests", id));
      setUpcomingTests((prev) => prev.filter((t) => t.id !== id));
      showToast("Upcoming test deleted.");
    } catch {
      showToast("Failed to delete upcoming test.", "error");
    }
  };

  if (!(userRole === "teacher" || userRole === "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-center text-gray-600">
            You don&apos;t have permission to access this page. Please contact
            an administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Test Management
          </h2>
          <p className="text-blue-100 text-sm">
            Create, manage, and review tests. (Admins & Teachers only)
          </p>
        </div>
        <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Loading test data...</p>
            </div>
          ) : (
            <>
              {/* Record Past Tests */}
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center border-b pb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-indigo-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Record Past Test
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Name
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Test Name"
                    value={newPastTest.testName}
                    onChange={(e) =>
                      setNewPastTest({
                        ...newPastTest,
                        testName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    value={newPastTest.subject}
                    onChange={(e) =>
                      setNewPastTest({
                        ...newPastTest,
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Topic"
                    value={newPastTest.topic || ""}
                    onChange={(e) =>
                      setNewPastTest({ ...newPastTest, topic: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={newPastTest.date || todayStr}
                    onChange={(e) =>
                      setNewPastTest({ ...newPastTest, date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Marks
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Max Marks"
                    value={newPastTest.maxMarks}
                    onChange={(e) =>
                      setNewPastTest({
                        ...newPastTest,
                        maxMarks: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Duration (e.g. 2h, 90min)"
                    value={newPastTest.duration}
                    onChange={(e) =>
                      setNewPastTest({
                        ...newPastTest,
                        duration: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-end">
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                    onClick={handleAddPastTest}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Test
                  </button>
                </div>
              </div>

              <button
                className={`mb-6 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                  showPastTests
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                }`}
                onClick={() => setShowPastTests((v) => !v)}
              >
                {showPastTests ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Hide Past Tests
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    View Past Tests
                  </>
                )}
              </button>

              {showPastTests && pastTests.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center my-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    No past tests
                  </h3>
                  <p className="text-gray-500 mb-4">
                    There are no past tests recorded yet.
                  </p>
                  <p className="text-sm text-gray-500">
                    Use the form above to record a past test or mark an upcoming
                    test as complete.
                  </p>
                </div>
              )}

              {showPastTests && pastTests.length > 0 && (
                <div className="overflow-x-auto mb-8 shadow-md rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-indigo-50 text-left">
                        <th className="px-4 py-3 font-medium text-indigo-800">
                          Test Name
                        </th>
                        <th className="px-4 py-3 font-medium text-indigo-800">
                          Class
                        </th>
                        <th className="px-4 py-3 font-medium text-indigo-800">
                          Batch
                        </th>
                        <th className="px-4 py-3 font-medium text-indigo-800">
                          Subject
                        </th>
                        <th className="px-4 py-3 font-medium text-indigo-800">
                          Topic
                        </th>
                        <th className="px-4 py-3 font-medium text-indigo-800">
                          Date
                        </th>
                        <th className="px-4 py-3 font-medium text-indigo-800">
                          Max Marks
                        </th>
                        <th className="px-4 py-3 font-medium text-indigo-800">
                          Duration
                        </th>
                        <th className="px-4 py-3 font-medium text-indigo-800">
                          Invigilator
                        </th>
                        <th className="px-4 py-3 font-medium text-indigo-800">
                          Room
                        </th>
                        <th className="px-4 py-3 font-medium text-indigo-800"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pastTests.map((test) => (
                        <tr key={test.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{test.testName}</td>
                          <td className="px-4 py-3">{test.class}</td>
                          <td className="px-4 py-3">{test.batch}</td>
                          <td className="px-4 py-3">{test.subject}</td>
                          <td className="px-4 py-3">{test.topic}</td>
                          <td className="px-4 py-3">{test.date}</td>
                          <td className="px-4 py-3">{test.maxMarks}</td>
                          <td className="px-4 py-3">{test.duration || "-"}</td>
                          <td className="px-4 py-3">
                            {test.invigilator || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {test.classRoomNo || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              className="text-blue-500 hover:text-blue-700 transition-colors mr-2"
                              onClick={() => openEditModal(test, "past")}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700 transition-colors"
                              onClick={() => handleDeletePastTest(test.id)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Schedule Upcoming Tests */}
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center border-b pb-2 mt-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-indigo-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                Schedule Upcoming Test
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Name
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Test Name"
                    value={newUpcomingTest.testName}
                    onChange={(e) =>
                      setNewUpcomingTest({
                        ...newUpcomingTest,
                        testName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Topic"
                    value={newUpcomingTest.topic || ""}
                    onChange={(e) =>
                      setNewUpcomingTest({
                        ...newUpcomingTest,
                        topic: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={newUpcomingTest.scheduledDate || todayStr}
                    onChange={(e) =>
                      setNewUpcomingTest({
                        ...newUpcomingTest,
                        scheduledDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Marks
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Max Marks"
                    value={newUpcomingTest.maxMarks}
                    onChange={(e) =>
                      setNewUpcomingTest({
                        ...newUpcomingTest,
                        maxMarks: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Duration (e.g. 2h, 90min)"
                    value={newUpcomingTest.duration}
                    onChange={(e) =>
                      setNewUpcomingTest({
                        ...newUpcomingTest,
                        duration: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Instructions"
                    rows="2"
                    value={newUpcomingTest.instructions}
                    onChange={(e) =>
                      setNewUpcomingTest({
                        ...newUpcomingTest,
                        instructions: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-end">
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                    onClick={handleAddUpcomingTest}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Test
                  </button>
                </div>
              </div>

              {/* Empty state for upcoming tests */}
              {paginatedUpcoming.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center my-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    No upcoming tests
                  </h3>
                  <p className="text-gray-500 mb-4">
                    There are no upcoming tests scheduled at the moment.
                  </p>
                  <p className="text-sm text-gray-500">
                    Use the form above to schedule a new test.
                  </p>
                </div>
              )}

              {/* Upcoming Tests Grid */}
              {paginatedUpcoming.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedUpcoming.map((test) => (
                    <div
                      key={test.id}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex flex-col mb-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-indigo-800 text-lg">
                          {test.testName}
                        </span>
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
                          {test.scheduledDate}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                        <div className="text-sm text-gray-700">
                          <span className="text-gray-500">Class:</span>{" "}
                          <span className="font-medium">{test.class}</span>
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="text-gray-500">Batch:</span>{" "}
                          <span className="font-medium">{test.batch}</span>
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="text-gray-500">Subject:</span>{" "}
                          <span className="font-medium">{test.subject}</span>
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="text-gray-500">Max Marks:</span>{" "}
                          <span className="font-medium">{test.maxMarks}</span>
                        </div>
                      </div>

                      {test.topic && (
                        <div className="mb-2 text-sm text-gray-700">
                          <span className="text-gray-500">Topic:</span>{" "}
                          <span className="font-medium">{test.topic}</span>
                        </div>
                      )}

                      {test.instructions && (
                        <div className="mb-3 text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-100">
                          <span className="text-gray-500 block mb-1">
                            Instructions:
                          </span>
                          <span className="font-normal">
                            {test.instructions}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between mt-auto pt-2">
                        <button
                          className="text-red-500 hover:text-red-700 transition-colors flex items-center text-sm"
                          onClick={() => handleDeleteUpcomingTest(test.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Delete
                        </button>
                        <button
                          className="text-blue-500 hover:text-blue-700 transition-colors flex items-center text-sm ml-2"
                          onClick={() => openEditModal(test, "upcoming")}
                        >
                          Edit
                        </button>
                        {completingTestId === test.id ? (
                          <div className="flex flex-col gap-3 w-2/3 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                            <h4 className="text-sm font-medium text-indigo-800">
                              Complete Test Details
                            </h4>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Invigilator
                              </label>
                              <select
                                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Room Number
                              </label>
                              <input
                                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Class Room No"
                                value={classRoomNo}
                                onChange={(e) => setClassRoomNo(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2 mt-1">
                              <button
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm shadow-sm transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                onClick={() => handleCompleteTest(test)}
                                disabled={!invigilator || !classRoomNo}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Confirm Complete
                              </button>
                              <button
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-sm shadow-sm transition-colors flex items-center justify-center"
                                onClick={() => {
                                  setCompletingTestId(null);
                                  setInvigilator("");
                                  setClassRoomNo("");
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                            onClick={() => setCompletingTestId(test.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Mark as Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalUpcomingPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    className="px-4 py-2 rounded-md bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors disabled:opacity-50 font-medium text-sm flex items-center"
                    onClick={() => setUpcomingPage((up) => Math.max(1, up - 1))}
                    disabled={upcomingPage === 1}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700 text-sm">
                    Page {upcomingPage} of {totalUpcomingPages}
                  </span>
                  <button
                    className="px-4 py-2 rounded-md bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors disabled:opacity-50 font-medium text-sm flex items-center"
                    onClick={() =>
                      setUpcomingPage((up) =>
                        Math.min(totalUpcomingPages, up + 1)
                      )
                    }
                    disabled={upcomingPage === totalUpcomingPages}
                  >
                    Next
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
              {/* Empty state for upcoming tests */}
              {paginatedUpcoming.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center my-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    No upcoming tests
                  </h3>
                  <p className="text-gray-500 mb-4">
                    There are no upcoming tests scheduled at the moment.
                  </p>
                  <p className="text-sm text-gray-500">
                    Use the form above to schedule a new test.
                  </p>
                </div>
              )}
              {showPastTests && pastTests.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center my-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    No past tests
                  </h3>
                  <p className="text-gray-500 mb-4">
                    There are no past tests recorded yet.
                  </p>
                  <p className="text-sm text-gray-500">
                    Use the form above to record a past test or mark an upcoming
                    test as complete.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this test? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 rounded-md text-white font-medium text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <h2 className="text-xl font-bold mb-4">
              Edit {editType === "past" ? "Past Test" : "Upcoming Test"}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <input
                className="border rounded px-3 py-2"
                name="testName"
                placeholder="Test Name"
                value={editForm.testName || ""}
                onChange={handleEditFormChange}
              />
              <select
                className="border rounded px-3 py-2"
                name="class"
                value={editForm.class || ""}
                onChange={handleEditFormChange}
              >
                <option value="">Select Class</option>
                {classOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <select
                className="border rounded px-3 py-2"
                name="batch"
                value={editForm.batch || ""}
                onChange={handleEditFormChange}
              >
                <option value="">Select Batch</option>
                {batchOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <select
                className="border rounded px-3 py-2"
                name="subject"
                value={editForm.subject || ""}
                onChange={handleEditFormChange}
              >
                <option value="">Select Subject</option>
                {subjectOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <input
                className="border rounded px-3 py-2"
                name="topic"
                placeholder="Topic"
                value={editForm.topic || ""}
                onChange={handleEditFormChange}
              />
              <input
                type="date"
                className="border rounded px-3 py-2"
                name={editType === "past" ? "date" : "scheduledDate"}
                value={
                  editType === "past"
                    ? editForm.date || ""
                    : editForm.scheduledDate || ""
                }
                onChange={handleEditFormChange}
              />
              <input
                className="border rounded px-3 py-2"
                name="maxMarks"
                placeholder="Max Marks"
                value={editForm.maxMarks || ""}
                onChange={handleEditFormChange}
              />
              {editType === "upcoming" && (
                <textarea
                  className="border rounded px-3 py-2"
                  name="instructions"
                  placeholder="Instructions"
                  value={editForm.instructions || ""}
                  onChange={handleEditFormChange}
                />
              )}
              <input
                className="border rounded px-3 py-2"
                name="duration"
                placeholder="Duration (e.g. 2h, 90min)"
                value={editForm.duration || ""}
                onChange={handleEditFormChange}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={handleSaveEdit}
              >
                Save
              </button>
            </div>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={closeEditModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      <Toasts />
    </div>
  );
};

export default TestManagement;
