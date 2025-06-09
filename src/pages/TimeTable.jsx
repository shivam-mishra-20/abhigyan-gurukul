import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { useSwipeable } from "react-swipeable";

const days = ["Class 7", "Class 8th Lakshya", "Class 8th Aadharshila"];
const periods = [
  "Period 1",
  "Period 2",
  "Period 3",
  "Period 4",
  "Period 5",
  "Period 6",
];
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

const TimeTable = () => {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // For mobile view tab navigation
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
  }, []);

  const fetchTimetable = async (date = selectedDate) => {
    setLoading(true);
    try {
      const dateStr = date.toLocaleDateString("en-CA"); // Format as YYYY-MM-DD
      const day = date.toLocaleDateString("en-US", { weekday: "long" });
      const docId = `${day}_${dateStr}`;

      // First try direct document fetch
      const docRef = doc(db, "TimeTable", docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTimetable(data.timetable);
        if (data.periods) {
          periods.splice(0, periods.length, ...data.periods);
        }
      } else {
        // If not found, fall back to query for the latest
        const q = query(collection(db, "TimeTable"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          let latest = null;
          for (let i = snapshot.docs.length - 1; i >= 0; i--) {
            const data = snapshot.docs[i].data();
            if (
              data.timetable &&
              Object.keys(data.timetable).length === rowHeaders.length
            ) {
              latest = data;
              break;
            }
          }
          if (!latest) latest = snapshot.docs[snapshot.docs.length - 1].data();
          setTimetable(latest.timetable);
          if (latest.periods) {
            periods.splice(0, periods.length, ...latest.periods);
          }
        } else {
          setTimetable(null);
        }
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
      setTimetable(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable(selectedDate);
    // eslint-disable-next-line
  }, [selectedDate]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeTab < rowHeaders.length - 1) {
        setActiveTab(activeTab + 1);
      }
    },
    onSwipedRight: () => {
      if (activeTab > 0) {
        setActiveTab(activeTab - 1);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
  });

  // Date selection handler
  const handleDateSelection = (dateObj) => {
    setSelectedDate(dateObj.date);
    setShowDatePicker(false);
  };

  // Set today's date
  const handleSetToday = () => {
    setSelectedDate(new Date());
  };

  // Render mobile view as cards
  const renderMobileView = () => {
    if (!timetable) return null;

    return (
      <div className="mt-4" {...swipeHandlers}>
        {/* Class Tabs */}
        <div className="overflow-x-auto mb-4">
          <div className="flex space-x-1 pb-2">
            {rowHeaders.map((className, index) => (
              <button
                key={className}
                onClick={() => setActiveTab(index)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === index
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {className}
              </button>
            ))}
          </div>
        </div>

        {/* Active Class Card with Animation */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 animate-fadeIn">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
            <h3 className="text-white font-bold text-lg">
              {rowHeaders[activeTab]}
            </h3>
            <p className="text-green-100 text-sm">
              {new Date().toLocaleDateString("en-US", { weekday: "long" })}
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {periods.map((period, idx) => {
              const cell = timetable[rowHeaders[activeTab]]?.[idx];
              return (
                <div
                  key={idx}
                  className="p-4 transition-all duration-300 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      {period}
                    </span>
                    {cell?.subject ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                        No Class
                      </span>
                    )}
                  </div>

                  {cell?.subject ? (
                    <div className="mt-2">
                      <div className="text-lg font-semibold text-gray-800">
                        {cell.subject}
                      </div>
                      {cell.teacher && (
                        <div className="flex items-center mt-1 text-gray-600">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                          </svg>
                          {cell.teacher}
                        </div>
                      )}
                      {cell.room && (
                        <div className="flex items-center mt-1 text-gray-600">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          Room {cell.room}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 flex justify-center py-4">
                      <svg
                        className="w-8 h-8 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Swipe indicator */}
          <div className="flex justify-center items-center p-3 bg-gray-50 text-xs text-gray-500">
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
      </div>
    );
  };

  // Render date selector component
  const renderDateSelector = () => (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-800">Select Date</h3>
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

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header with date selector button */}
      <div className="bg-white rounded-lg shadow-lg p-5 mb-6">
        <div className="flex flex-wrap justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-green-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Time Table
          </h2>

          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-md transition-colors shadow-sm mb-2 md:mb-0"
          >
            <svg
              className="w-5 h-5 text-gray-500"
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
            {selectedDate.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </button>
        </div>

        <div className="flex items-center text-gray-500 mt-2">
          <svg
            className="w-5 h-5 mr-1 text-green-600"
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
          <p className="font-medium">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && renderDateSelector()}

      {loading ? (
        <div className="flex justify-center items-center p-10">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-green-500 animate-spin"></div>
            <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-green-300 animate-spin absolute top-2 left-2"></div>
          </div>
          <span className="ml-4 text-lg text-gray-600 font-medium">
            Loading timetable...
          </span>
        </div>
      ) : timetable ? (
        <>
          {/* Show mobile view on small screens and table view on larger screens */}
          <div className={`${isMobile ? "block" : "hidden"}`}>
            {renderMobileView()}
          </div>

          <div
            className={`bg-white rounded-lg shadow-lg p-3 overflow-hidden ${
              isMobile ? "hidden" : "block"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <th className="px-3 py-3 text-left text-sm font-semibold uppercase tracking-wider sticky top-0 left-0 z-10 shadow-sm border-r border-green-400">
                      Class / Period
                    </th>
                    {periods.map((period) => (
                      <th
                        key={period}
                        className="px-3 py-3 text-center text-sm font-semibold uppercase tracking-wider sticky top-0 z-10 shadow-sm border-r border-green-400"
                      >
                        {period}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rowHeaders.map((row, rowIndex) => (
                    <tr
                      key={row}
                      className={
                        rowIndex % 2 === 0
                          ? "bg-gray-50 hover:bg-gray-100"
                          : "hover:bg-gray-100"
                      }
                    >
                      <td className="px-3 py-3 text-sm font-medium text-gray-800 sticky left-0 bg-green-50 border-r border-gray-200 shadow-sm z-5">
                        {row}
                      </td>
                      {periods.map((_, idx) => (
                        <td
                          key={idx}
                          className="px-2 py-2 align-top border border-gray-200"
                          style={{ minWidth: 110, height: 80 }}
                        >
                          {timetable &&
                          timetable[row] &&
                          timetable[row][idx] &&
                          timetable[row][idx].subject ? (
                            <div className="p-2 h-full rounded bg-white transition-all duration-300 hover:shadow-md flex flex-col justify-between">
                              <div className="font-semibold text-green-700">
                                {timetable[row][idx].subject}
                              </div>
                              <div className="mt-1">
                                {timetable[row][idx].teacher && (
                                  <div className="text-xs text-gray-600 flex items-center gap-1">
                                    <svg
                                      className="h-3 w-3"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                    </svg>
                                    {timetable[row][idx].teacher}
                                  </div>
                                )}
                                {timetable[row][idx].room && (
                                  <div className="text-xs text-gray-600 flex items-center gap-1">
                                    <svg
                                      className="h-3 w-3"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1v1a1 1 0 11-2 0v-1H7v1a1 1 0 11-2 0v-1a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Room {timetable[row][idx].room}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-300">
                              <svg
                                className="h-6 w-6 opacity-30"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M6 18L18 6M6 6l12 12"
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
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-500 text-lg">
            No timetable found for this class and batch.
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeTable;
