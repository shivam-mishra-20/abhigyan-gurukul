import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
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

  return (
    <div className="p-4 w-full max-w-full mx-auto">
      <h2 className="text-xl font-bold mb-4 text-green-800 tracking-tight">
        Goals
      </h2>
      <div>
        <h3 className="text-base font-semibold mb-3 text-green-700">
          Current Goals
        </h3>
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <input
            type="text"
            className="border border-green-200 rounded px-2 py-1 text-xs"
            placeholder="Filter by user"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          />
          <input
            type="text"
            className="border border-green-200 rounded px-2 py-1 text-xs"
            placeholder="Filter by goal name"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <input
            type="text"
            className="border border-green-200 rounded px-2 py-1 text-xs"
            placeholder="Filter by date (e.g. 5/18/2024)"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        {filteredGoals.length === 0 ? (
          <p className="text-gray-400">No goals found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGoals.map((goal, idx) => (
              <div
                key={idx}
                className="bg-white border border-green-100 rounded-lg shadow p-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 uppercase tracking-wide">
                    User: {goal.user || "Unknown"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {goal.created && typeof goal.created.toDate === "function"
                      ? goal.created.toDate().toLocaleDateString()
                      : goal.created && goal.created instanceof Date
                      ? goal.created.toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-200 text-green-900 uppercase tracking-wide">
                    {goal.category}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-base font-semibold text-green-900">
                    {goal.text}
                  </span>
                  <span className="ml-2 text-xs text-green-600 font-medium">
                    (in {goal.days} days)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    Assigned: {goal.assignedTo}
                  </span>
                </div>
                {goal.notes && (
                  <div className="bg-gray-50 border-l-4 border-green-300 text-gray-700 px-3 py-2 rounded text-xs mt-2">
                    <span className="font-semibold">Notes:</span> {goal.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {isEditable && (
        <form
          onSubmit={handleAddGoal}
          className="mt-8 bg-white rounded-lg shadow p-4 space-y-3 border border-green-100"
        >
          <div>
            <label className="block text-sm font-semibold mb-1 text-green-700">
              Goal Description
            </label>
            <input
              type="text"
              className="w-full border-2 border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 bg-green-50"
              placeholder="e.g. Complete chapter 1"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-green-700">
              Category
            </label>
            <select
              className="w-full border-2 border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 bg-green-50"
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
            <label className="block text-sm font-semibold mb-1 text-green-700">
              Assigned To
            </label>
            <input
              type="text"
              className="w-full border-2 border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 bg-green-50"
              placeholder="e.g. John Doe or Class 10A"
              value={goalAssignedTo}
              onChange={(e) => setGoalAssignedTo(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-green-700">
              Target (days)
            </label>
            <input
              type="number"
              min="1"
              className="w-full border-2 border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 bg-green-50"
              placeholder="e.g. 5"
              value={goalDays}
              onChange={(e) => setGoalDays(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-green-700">
              Notes (optional)
            </label>
            <textarea
              className="w-full border-2 border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 bg-green-50"
              placeholder="Additional notes..."
              value={goalNotes}
              onChange={(e) => setGoalNotes(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-200"
          >
            Add Goal
          </button>
        </form>
      )}
    </div>
  );
};

export default Goals;
