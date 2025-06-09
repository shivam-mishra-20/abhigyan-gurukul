import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Goals = () => {
  const [goalText, setGoalText] = useState("");
  const [goalDays, setGoalDays] = useState("");
  const [goalCategory, setGoalCategory] = useState("");
  const [goalAssignedTo, setGoalAssignedTo] = useState("");
  const [goalNotes, setGoalNotes] = useState("");
  const [goals, setGoals] = useState([]);
  const [filterUser, setFilterUser] = useState("");
  const [filterText, setFilterText] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const goalsPerPage = 3;
  const userRole = localStorage.getItem("userRole");
  const userName =
    localStorage.getItem("studentName") ||
    localStorage.getItem("teacherName") ||
    localStorage.getItem("adminName") ||
    "Unknown";
  const isEditable = userRole === "teacher" || userRole === "admin";

  useEffect(() => {
    const fetchGoals = async () => {
      const goalsRef = collection(db, "Goals");
      const snapshot = await getDocs(goalsRef);
      const fetchedGoals = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(fetchedGoals);
    };
    fetchGoals();
  }, []);

  const handleGoalCompletion = async (goalId, isComplete) => {
    try {
      const goalRef = doc(db, "Goals", goalId);
      await updateDoc(goalRef, {
        completed: isComplete,
        completedAt: isComplete ? serverTimestamp() : null,
      });

      setGoals(
        goals.map((goal) =>
          goal.id === goalId ? { ...goal, completed: isComplete } : goal
        )
      );

      if (isComplete) {
        try {
          await deleteDoc(goalRef);
          setGoals((goals) => goals.filter((g) => g.id !== goalId));
          toast.success("Goal archived successfully");
        } catch (error) {
          toast.error("Failed to archive goal");
        }
      }
    } catch (error) {
      toast.error("Failed to update goal status");
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalText.trim() || !goalDays.trim() || !goalAssignedTo.trim()) return;

    try {
      const newGoal = {
        text: goalText.trim(),
        days: goalDays.trim(),
        category: goalCategory.trim() || "Academic",
        assignedTo: goalAssignedTo.trim(),
        notes: goalNotes.trim(),
        user: userName,
        created: serverTimestamp(),
        completed: false,
      };

      const docRef = await addDoc(collection(db, "Goals"), newGoal);
      setGoals([...goals, { ...newGoal, id: docRef.id, created: new Date() }]);

      setGoalText("");
      setGoalDays("");
      setGoalCategory("");
      setGoalAssignedTo("");
      setGoalNotes("");

      Swal.fire("Success", "Goal created successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to create goal", "error");
    }
  };

  // Filtering logic
  const filteredGoals = goals.filter((goal) => {
    const userMatch = filterUser
      ? (goal.user || "Unknown")
          .toLowerCase()
          .includes(filterUser.toLowerCase())
      : true;
    const textMatch = filterText
      ? (goal.text || "").toLowerCase().includes(filterText.toLowerCase())
      : true;
    const dateMatch = filterDate
      ? (goal.created && typeof goal.created.toDate === "function"
          ? goal.created.toDate().toLocaleDateString()
          : goal.created && goal.created instanceof Date
          ? goal.created.toLocaleDateString()
          : "N/A") === filterDate
      : true;
    return userMatch && textMatch && dateMatch;
  });

  // Pagination logic
  const indexOfLastGoal = currentPage * goalsPerPage;
  const indexOfFirstGoal = indexOfLastGoal - goalsPerPage;
  const currentGoals = filteredGoals.slice(indexOfFirstGoal, indexOfLastGoal);
  const totalPages = Math.ceil(filteredGoals.length / goalsPerPage);

  return (
    <div className="p-6 w-full max-w-full mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight flex items-center">
        <span className="bg-green-500 w-2 h-8 rounded mr-3"></span>
        Goals Management
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Current Goals</h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 w-full sm:w-auto">
            <input
              type="text"
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors w-full sm:w-auto"
              placeholder="Filter by user"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            />
            <input
              type="text"
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors w-full sm:w-auto"
              placeholder="Filter by goal"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <input
              type="text"
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500 transition-colors w-full sm:w-auto"
              placeholder="Date (MM/DD/YYYY)"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
        {filteredGoals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">📋</div>
            <p>No goals found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
              {currentGoals.map((goal, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                    goal.completed ? "bg-green-50" : ""
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={goal.completed || false}
                          onChange={(e) =>
                            handleGoalCompletion(goal.id, e.target.checked)
                          }
                          className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                        />
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                          {goal.user || "Unknown"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {goal.created &&
                        typeof goal.created.toDate === "function"
                          ? goal.created.toDate().toLocaleDateString()
                          : goal.created && goal.created instanceof Date
                          ? goal.created.toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        {goal.category}
                      </span>
                    </div>
                    <h4 className="text-gray-800 font-medium mb-2">
                      {goal.text}
                    </h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-green-600 text-sm font-medium">
                        {goal.days} days
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        Assigned: {goal.assignedTo}
                      </span>
                    </div>
                    {goal.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        {goal.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-green-100 text-green-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-200 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-green-100 text-green-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-200 transition-colors"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Add Goal Form */}
      {isEditable && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Add New Goal
          </h3>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Goal Description
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="e.g. Complete chapter 1"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Category
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-green-500 transition-colors"
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Academic">Academic</option>
                  <option value="Personal">Personal</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Target (days)
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="e.g. 5"
                  value={goalDays}
                  onChange={(e) => setGoalDays(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Assigned To
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="e.g. John Doe or Class 10A"
                value={goalAssignedTo}
                onChange={(e) => setGoalAssignedTo(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Notes (optional)
              </label>
              <textarea
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-green-500 transition-colors min-h-[100px]"
                placeholder="Additional notes..."
                value={goalNotes}
                onChange={(e) => setGoalNotes(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
            >
              Add Goal
            </button>
          </form>
        </div>
      )}
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        limit={3}
        toastClassName="!rounded-lg !shadow-lg"
        bodyClassName="!text-sm"
      />
    </div>
  );
};

export default Goals;
