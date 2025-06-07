import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (
      !goalText.trim() ||
      !goalDays.trim() ||
      !goalCategory.trim() ||
      !goalAssignedTo.trim()
    )
      return;
    const newGoal = {
      text: goalText.trim(),
      days: goalDays.trim(),
      category: goalCategory.trim(),
      assignedTo: goalAssignedTo.trim(),
      notes: goalNotes.trim(),
      user: userName,
      created: serverTimestamp(),
    };
    await addDoc(collection(db, "Goals"), newGoal);
    setGoals([...goals, { ...newGoal, created: new Date() }]);
    setGoalText("");
    setGoalDays("");
    setGoalCategory("");
    setGoalAssignedTo("");
    setGoalNotes("");
  };

  const handleDeleteClick = (goal) => {
    setGoalToDelete(goal);
    setDeleteModalOpen(true);
  };

  const handleDeleteGoal = async () => {
    if (!goalToDelete || !goalToDelete.id) return;

    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "Goals", goalToDelete.id));
      setGoals(goals.filter((goal) => goal.id !== goalToDelete.id));
      setDeleteModalOpen(false);
      setGoalToDelete(null);
    } catch (error) {
      console.error("Error deleting goal:", error);
    } finally {
      setIsDeleting(false);
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

  // Format date function to make code more readable
  const formatDate = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleDateString();
    } else if (timestamp && timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    return "N/A";
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "academic":
        return "bg-blue-100 text-blue-700";
      case "personal":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <div className="p-5 w-full max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-green-800 tracking-tight border-b border-green-200 pb-2">
        Goals Dashboard
      </h2>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3 text-green-700 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
              clipRule="evenodd"
            />
          </svg>
          Filter Goals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              By User
            </label>
            <input
              type="text"
              className="border border-green-200 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="Enter user name"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              By Goal Text
            </label>
            <input
              type="text"
              className="border border-green-200 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="Enter goal description"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              By Date
            </label>
            <input
              type="text"
              className="border border-green-200 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="e.g. 5/18/2024"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
        {filteredGoals.length > 0 && (
          <p className="mt-2 text-sm text-gray-500">
            Showing {filteredGoals.length} of {goals.length} goals
          </p>
        )}
      </div>

      {/* Goals List */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-green-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Current Goals
        </h3>

        {filteredGoals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-400 font-medium">
              No goals found matching your criteria.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your filters or create a new goal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col"
              >
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(
                        goal.category
                      )} uppercase tracking-wide`}
                    >
                      {goal.category}
                    </span>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                      {formatDate(goal.created)}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-gray-800 mt-1">
                    {goal.text}
                  </h4>
                </div>

                <div className="p-4 bg-white flex-grow">
                  <div className="flex flex-wrap items-center text-sm text-gray-600 mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium text-blue-600">
                      {goal.days} days
                    </span>
                  </div>

                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500">Assigned to</p>
                      <p className="font-medium text-gray-700">
                        {goal.assignedTo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500">Created by</p>
                      <p className="font-medium text-gray-700">
                        {goal.user || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {goal.notes && (
                    <div className="bg-gray-50 border-l-3 border-amber-300 px-3 py-2 rounded-md text-sm text-gray-600 mt-3">
                      <p className="font-semibold text-xs text-amber-700 mb-1">
                        Notes:
                      </p>
                      <p className="text-sm">{goal.notes}</p>
                    </div>
                  )}

                  {isEditable && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => handleDeleteClick(goal)}
                        className="flex items-center text-sm text-red-500 hover:text-red-700 font-medium hover:bg-red-50 px-3 py-1 rounded-md transition duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
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
                        Delete Goal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Goal Form */}
      {isEditable && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-green-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Create New Goal
          </h3>

          <form onSubmit={handleAddGoal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Goal Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="What is the goal?"
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Assigned To <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="Individual or group name"
                  value={goalAssignedTo}
                  onChange={(e) => setGoalAssignedTo(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Target Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="Days to complete"
                  value={goalDays}
                  onChange={(e) => setGoalDays(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Notes (optional)
              </label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="Any additional information or context..."
                value={goalNotes}
                onChange={(e) => setGoalNotes(e.target.value)}
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Goal
            </button>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fadeIn">
            <h4 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Deletion
            </h4>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the goal:{" "}
              <span className="font-semibold text-gray-800">
                {goalToDelete?.text}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGoal}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete Goal"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
