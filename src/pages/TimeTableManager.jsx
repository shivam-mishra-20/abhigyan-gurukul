import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  setDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { useSwipeable } from "react-swipeable";

const periods = [
  "3:30 - 4:30PM",
  "4:30 - 5:30PM",
  "5:30 - 6:30PM",
  "6:30 - 7:30PM",
  "7:30 - 8:30PM",
  "8:30 - 9:30PM",
];
const subjects = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "English",
  "Biology",
  "Language",
  "Social Science",
];
const teachers = [
  "Pratyaksha Ma'am",
  "Dhara Ma'am",
  "Sonia Ma'am",
  "Preeti Ma'am",
  "Abhigyan Sir",
  "Chandan Sir",
  "Nitesh Sir",
  "Kedar Sir",
  "Ankit Sir",
  "Milan Sir",
  "Nitish Sir",
  "Prakash Sir",
];
const classes = ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
const rowHeaders = [
  "Class 7th",
  "Class 8th Lakshya",
  "Class 8th Aadharshila",
  "Class 9th Lakshya",
  "Class 9th Aadharshila",
  "Class 10th Lakshya",
  "Class 10th Aadharshila",
  "Class 10th Basic",
  "Class 11th Science",
  "Class 11th Commerce",
  "Class 12th BIO",
  "Class 12th MATHS",
  "Class 12th Commerce",
  "Keshav 11th",
];

const TimeTableManager = () => {
  const [timetable, setTimetable] = useState(() => {
    const obj = {};
    rowHeaders.forEach((row) => {
      obj[row] = periods.map(() => ({
        subject: "",
        teacher: "",
        room: "",
      }));
    });
    return obj;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingCell, setEditingCell] = useState({
    row: null,
    periodIdx: null,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [activeClass, setActiveClass] = useState(0);
  const [activePeriod, setActivePeriod] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  useEffect(() => {
    // Check if the screen is mobile-sized
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Fetch available dates with timetables
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const q = query(
          collection(db, "TimeTable"),
          orderBy("createdAt", "desc"),
          limit(30)
        );
        const snapshot = await getDocs(q);
        const dates = [];
        snapshot.forEach((doc) => {
          const id = doc.id;
          // Parse date from ID format like "Monday_2023-01-01"
          const datePart = id.split("_")[1];
          if (datePart) {
            dates.push({
              id: doc.id,
              date: new Date(datePart),
              display: new Date(datePart).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
            });
          }
        });
        setAvailableDates(dates);
      } catch (error) {
        console.error("Error fetching available dates:", error);
      }
    };

    fetchAvailableDates();
  }, [saved]); // Refresh after saving

  const fetchTimetableForDate = async (date) => {
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
    const docId = `${day}_${dateStr}`;
    const docRef = doc(db, "TimeTable", docId);
    const docSnap = await getDoc(docRef);

    // Initialize empty timetable as fallback
    const emptyTimetable = {};
    rowHeaders.forEach((row) => {
      emptyTimetable[row] = periods.map(() => ({
        subject: "",
        teacher: "",
        room: "",
      }));
    });

    if (docSnap.exists()) {
      const data = docSnap.data();
      setTimetable(data.timetable || emptyTimetable);
    } else {
      setTimetable(emptyTimetable);
    }
  };

  useEffect(() => {
    fetchTimetableForDate(selectedDate);
  }, [selectedDate]);

  const handleCellChange = (day, periodIdx, field, value) => {
    setTimetable((prev) => {
      const updated = { ...prev };
      updated[day] = [...updated[day]];
      updated[day][periodIdx] = { ...updated[day][periodIdx], [field]: value };
      return updated;
    });
  };

  const getDocId = (date = selectedDate) => {
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
    return `${day}_${dateStr}`;
  };

  const handleSave = async () => {
    setSaving(true);
    const docId = getDocId(selectedDate);
    try {
      // Always update the document for the selected date
      await setDoc(doc(db, "TimeTable", docId), {
        timetable,
        periods,
        createdAt: new Date(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving timetable:", error);
      alert("Failed to save timetable. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Date selection handler
  const handleDateSelection = (dateObj) => {
    setSelectedDate(dateObj.date);
    setShowDatePicker(false);
  };

  // Set today's date
  const handleSetToday = () => {
    setSelectedDate(new Date());
  };

  // Render date selector component
  const renderDateSelector = () => (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden animate-fadeIn">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-800">
          Select Date to Edit
        </h3>
        <button
          onClick={() => setShowDatePicker(false)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <button
          onClick={handleSetToday}
          className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors py-2 px-4 rounded-md mb-4 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Today's Timetable
        </button>

        <div className="max-h-64 overflow-y-auto">
          {availableDates.length > 0 ? (
            <div className="space-y-2">
              {availableDates.map((dateObj) => (
                <button
                  key={dateObj.id}
                  onClick={() => handleDateSelection(dateObj)}
                  className={`w-full text-left py-2 px-3 rounded-md transition-colors ${
                    dateObj.date.toDateString() === selectedDate.toDateString()
                      ? "bg-green-100 text-green-800 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {dateObj.display}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No timetables found
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeClass < rowHeaders.length - 1) {
        setActiveClass(activeClass + 1);
      }
    },
    onSwipedRight: () => {
      if (activeClass > 0) {
        setActiveClass(activeClass - 1);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
  });

  // Mobile view renderer for the timetable manager
  const renderMobileView = () => {
    return (
      <div
        className="bg-white rounded-xl shadow-lg overflow-hidden"
        {...swipeHandlers}
      >
        {/* Mobile Class Navigation */}
        <div className="overflow-x-auto">
          <div className="flex space-x-1 p-2 bg-gray-50 border-b">
            {rowHeaders.map((className, index) => (
              <button
                key={className}
                onClick={() => setActiveClass(index)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeClass === index
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {className}
              </button>
            ))}
          </div>
        </div>

        {/* Active Class Title */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
          <h3 className="text-white font-bold text-lg flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            {rowHeaders[activeClass]}
          </h3>
          <p className="text-green-100 text-sm">
            {new Date().toLocaleDateString("en-US", { weekday: "long" })}
          </p>
        </div>

        {/* Period Selector */}
        <div className="p-3 bg-white">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Period
          </label>
          <div className="grid grid-cols-3 gap-2">
            {periods.map((period, idx) => (
              <button
                key={idx}
                onClick={() => setActivePeriod(idx)}
                className={`p-2 text-center text-xs rounded-md transition-all duration-200 ${
                  activePeriod === idx
                    ? "bg-green-100 text-green-800 border-2 border-green-300"
                    : "bg-gray-50 text-gray-600 border border-gray-200"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Cell Editor */}
        <div className="p-4 border-t border-gray-200 animate-fadeIn">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Edit Class Details
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                value={
                  timetable[rowHeaders[activeClass]]?.[activePeriod]?.subject ||
                  ""
                }
                onChange={(e) =>
                  handleCellChange(
                    rowHeaders[activeClass],
                    activePeriod,
                    "subject",
                    e.target.value
                  )
                }
              >
                <option value="">Select Subject</option>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher
              </label>
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                value={
                  timetable[rowHeaders[activeClass]]?.[activePeriod]?.teacher ||
                  ""
                }
                onChange={(e) =>
                  handleCellChange(
                    rowHeaders[activeClass],
                    activePeriod,
                    "teacher",
                    e.target.value
                  )
                }
              >
                <option value="">Select Teacher</option>
                {teachers.map((teach) => (
                  <option key={teach} value={teach}>
                    {teach}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Room No."
                value={
                  timetable[rowHeaders[activeClass]]?.[activePeriod]?.room || ""
                }
                onChange={(e) =>
                  handleCellChange(
                    rowHeaders[activeClass],
                    activePeriod,
                    "room",
                    e.target.value
                  )
                }
              />
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 px-3 py-2 rounded text-sm font-medium transition-colors duration-200"
                onClick={() => {
                  handleCellChange(
                    rowHeaders[activeClass],
                    activePeriod,
                    "subject",
                    ""
                  );
                  handleCellChange(
                    rowHeaders[activeClass],
                    activePeriod,
                    "teacher",
                    ""
                  );
                  handleCellChange(
                    rowHeaders[activeClass],
                    activePeriod,
                    "room",
                    ""
                  );
                }}
              >
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear
                </div>
              </button>
              <button
                className="flex-1 bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 px-3 py-2 rounded text-sm font-medium transition-colors duration-200"
                onClick={() => {
                  // Just save the cell value
                }}
              >
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Done
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Preview
          </h4>
          <div className="bg-white rounded-lg shadow p-3 mt-1">
            {timetable[rowHeaders[activeClass]]?.[activePeriod]?.subject ? (
              <>
                <div className="font-semibold text-green-700">
                  {timetable[rowHeaders[activeClass]][activePeriod].subject}
                </div>
                {timetable[rowHeaders[activeClass]][activePeriod].teacher && (
                  <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                    {timetable[rowHeaders[activeClass]][activePeriod].teacher}
                  </div>
                )}
                {timetable[rowHeaders[activeClass]][activePeriod].room && (
                  <div className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    Room {timetable[rowHeaders[activeClass]][activePeriod].room}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-3 text-gray-400">
                <svg
                  className="w-8 h-8 mb-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-sm">No class scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Swipe indicator */}
        <div className="flex justify-center items-center p-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-200">
          <svg
            className="w-4 h-4 mr-1"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
          </svg>
          Swipe to navigate classes
          <svg
            className="w-4 h-4 ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </div>
      </div>
    );
  };

  // Function to clear all cells in the timetable
  const handleClearTimetable = () => {
    // Create an empty timetable structure
    const emptyTimetable = {};
    rowHeaders.forEach((row) => {
      emptyTimetable[row] = periods.map(() => ({
        subject: "",
        teacher: "",
        room: "",
      }));
    });

    setTimetable(emptyTimetable);
    setShowClearConfirmation(false);
  };

  // Render confirmation modal
  const renderClearConfirmation = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <svg
            className="w-6 h-6 text-red-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Confirm Clear Timetable
        </h3>

        <p className="text-gray-600 mb-6">
          Are you sure you want to clear all cells from the timetable for{" "}
          <span className="font-semibold">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowClearConfirmation(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleClearTimetable}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Clear All
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Show clear confirmation modal if open */}
      {showClearConfirmation && renderClearConfirmation()}

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Time Table Manager
            </h2>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-md transition-colors mt-1"
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </button>
              <p className="text-gray-500 font-medium ml-3">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Add Clear button */}
            <button
              className="mt-2 md:mt-0 bg-white border border-red-500 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1"
              onClick={() => setShowClearConfirmation(true)}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear
            </button>

            <button
              className="mt-2 md:mt-0 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-all duration-200 flex items-center gap-2"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  <span>Save Timetable</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Date Picker Modal */}
        {showDatePicker && renderDateSelector()}

        {saved && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md flex items-center animate-fadeIn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-500 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-green-700 font-medium">
              Timetable for{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              successfully saved!
            </span>
          </div>
        )}
      </div>

      {/* Show mobile view on small screens and table view on larger screens */}
      <div className={`${isMobile ? "block" : "hidden"}`}>
        {renderMobileView()}
      </div>

      <div className={`${isMobile ? "hidden" : "block"}`}>
        <div className="bg-white rounded-xl shadow-lg p-3 md:p-5 overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <th className="px-3 py-4 text-left text-sm font-semibold uppercase tracking-wider sticky top-0 left-0 z-10 shadow-sm border-r border-green-400">
                    Class / Period
                  </th>
                  {periods.map((period) => (
                    <th
                      key={period}
                      className="px-3 py-4 text-center text-sm font-semibold uppercase tracking-wider sticky top-0 z-10 shadow-sm whitespace-nowrap border-r border-green-400"
                    >
                      {period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rowHeaders.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={rowIdx % 2 === 0 ? "bg-gray-50" : ""}
                  >
                    <td className="px-3 py-3 text-sm font-medium text-gray-800 whitespace-nowrap sticky left-0 bg-green-50 border-r border-gray-200 shadow-sm z-5">
                      {row}
                    </td>
                    {periods.map((period, periodIdx) => (
                      <td
                        key={periodIdx}
                        className="border border-gray-200 p-1 min-w-[120px]"
                        style={{ height: 100 }}
                        onClick={() => {
                          setEditingCell({ row, periodIdx });
                        }}
                      >
                        {editingCell.row === row &&
                        editingCell.periodIdx === periodIdx ? (
                          <div className="bg-white rounded-lg shadow-lg p-3 space-y-2 animate-fadeIn border border-green-300">
                            <select
                              className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                              value={timetable[row]?.[periodIdx]?.subject || ""}
                              onChange={(e) =>
                                handleCellChange(
                                  row,
                                  periodIdx,
                                  "subject",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select Subject</option>
                              {subjects.map((sub) => (
                                <option key={sub} value={sub}>
                                  {sub}
                                </option>
                              ))}
                            </select>
                            <select
                              className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                              value={timetable[row]?.[periodIdx]?.teacher || ""}
                              onChange={(e) =>
                                handleCellChange(
                                  row,
                                  periodIdx,
                                  "teacher",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select Teacher</option>
                              {teachers.map((teach) => (
                                <option key={teach} value={teach}>
                                  {teach}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                              placeholder="Room No."
                              value={timetable[row]?.[periodIdx]?.room || ""}
                              onChange={(e) =>
                                handleCellChange(
                                  row,
                                  periodIdx,
                                  "room",
                                  e.target.value
                                )
                              }
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCellChange(
                                    row,
                                    periodIdx,
                                    "subject",
                                    ""
                                  );
                                  handleCellChange(
                                    row,
                                    periodIdx,
                                    "teacher",
                                    ""
                                  );
                                  handleCellChange(row, periodIdx, "room", "");
                                  setEditingCell({
                                    row: null,
                                    periodIdx: null,
                                  });
                                }}
                              >
                                Clear
                              </button>
                              <button
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCell({
                                    row: null,
                                    periodIdx: null,
                                  });
                                }}
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        ) : timetable[row]?.[periodIdx]?.subject ||
                          timetable[row]?.[periodIdx]?.teacher ||
                          timetable[row]?.[periodIdx]?.room ? (
                          <div className="h-full p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer group">
                            <div className="font-semibold text-green-700">
                              {timetable[row][periodIdx].subject}
                            </div>
                            {timetable[row][periodIdx].teacher && (
                              <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                </svg>
                                {timetable[row][periodIdx].teacher}
                              </div>
                            )}
                            {timetable[row][periodIdx].room && (
                              <div className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1v1a1 1 0 11-2 0v-1H7v1a1 1 0 11-2 0v-1a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Room {timetable[row][periodIdx].room}
                              </div>
                            )}
                            <button
                              className="mt-2 opacity-0 group-hover:opacity-100 text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 text-xs rounded-md transition-all duration-200 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCell({ row, periodIdx });
                              }}
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer rounded-lg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTableManager;
