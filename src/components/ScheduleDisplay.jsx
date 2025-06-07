/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaClock,
  FaChalkboardTeacher,
  FaBook,
  FaSchool,
  FaRegCalendarCheck,
  FaTable,
  FaList,
  FaChevronDown,
  FaChevronRight,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ScheduleDisplay = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "table"
  const [weekStartDate, setWeekStartDate] = useState(getStartOfWeek());
  const [isMobile, setIsMobile] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0); // Moved to top level

  const userRole = localStorage.getItem("userRole");
  const studentClass = localStorage.getItem("studentClass") || "";
  const studentBatch = localStorage.getItem("studentBatch") || "";
  const teacherName = localStorage.getItem("teacherName") || "";

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    // Using onSnapshot for real-time updates
    const fetchSchedules = () => {
      try {
        setLoading(true);
        const scheduleRef = collection(db, "Schedule");
        let scheduleQuery;

        if (userRole === "student") {
          // For students: filter by their class and batch if available
          if (studentBatch) {
            scheduleQuery = query(
              scheduleRef,
              where("class", "==", studentClass),
              where("batch", "==", studentBatch)
            );
          } else {
            scheduleQuery = query(
              scheduleRef,
              where("class", "==", studentClass)
            );
          }
        } else {
          // For teachers and admins: show all schedules
          scheduleQuery = scheduleRef;
        }

        const unsubscribe = onSnapshot(
          scheduleQuery,
          (snapshot) => {
            const fetchedSchedules = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Sort by day and then by start time
            fetchedSchedules.sort((a, b) => {
              // First sort by day of week
              const dayOrder = {
                Monday: 1,
                Tuesday: 2,
                Wednesday: 3,
                Thursday: 4,
                Friday: 5,
                Saturday: 6,
              };
              const dayDiff = (dayOrder[a.day] || 0) - (dayOrder[b.day] || 0);

              if (dayDiff !== 0) return dayDiff;

              // Then sort by start time
              const aTime = a.startTime.split(":").map(Number);
              const bTime = b.startTime.split(":").map(Number);

              if (aTime[0] !== bTime[0]) return aTime[0] - bTime[0]; // Compare hours
              return aTime[1] - bTime[1]; // Compare minutes
            });

            setSchedules(fetchedSchedules);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching schedules:", error);
            setError("Failed to load schedules. Please try again.");
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up schedule listener:", error);
        setError("Failed to connect to schedule database.");
        setLoading(false);
        return () => {};
      }
    };

    const unsubscribe = fetchSchedules();
    return () => unsubscribe && unsubscribe();
  }, [userRole, studentClass, studentBatch, teacherName]);

  // Filter schedules based on selected day and search term
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesDay = !selectedDay || schedule.day === selectedDay;
    const matchesSearch =
      !searchTerm ||
      schedule.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (schedule.notes &&
        schedule.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesDay && matchesSearch;
  });

  // Group schedules by day
  const schedulesByDay = filteredSchedules.reduce((acc, schedule) => {
    const day = schedule.day || "Unspecified";
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {});

  // Format time to 12-hour format
  const formatTime = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${suffix}`;
  };

  // Get today's schedule
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaySchedules = schedules.filter((schedule) => schedule.day === today);

  // Get the next class for today
  const getNextClass = () => {
    if (todaySchedules.length === 0) return null;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return todaySchedules.find((schedule) => {
      const [hours, minutes] = schedule.startTime.split(":").map(Number);
      return (
        hours > currentHour ||
        (hours === currentHour && minutes > currentMinute)
      );
    });
  };

  const nextClass = getNextClass();

  // Function to calculate the start of the week (Monday)
  function getStartOfWeek(date = new Date()) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(date.setDate(diff));
  }

  // Generate dates for the current week
  const generateWeekDates = (startDate) => {
    const dates = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 6; i++) {
      // Monday to Saturday (6 days)
      dates.push({
        date: new Date(currentDate),
        dayName: days[i],
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // Get all time slots from the schedules
  const getUniqueTimeSlots = () => {
    const timeSet = new Set();
    schedules.forEach((schedule) => {
      if (schedule.startTime) timeSet.add(schedule.startTime);
    });
    return Array.from(timeSet).sort();
  };

  // Function to get schedule for a specific day and time
  const getScheduleForDayAndTime = (day, time) => {
    return schedules.filter(
      (schedule) => schedule.day === day && schedule.startTime === time
    );
  };

  // Navigate to previous/next week
  const navigateWeek = (direction) => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setWeekStartDate(newDate);
  };

  // Format date as YYYY-MM-DD
  const formatDateToString = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Render the table view of schedules
  const renderTableView = () => {
    const weekDates = generateWeekDates(weekStartDate);
    const timeSlots = getUniqueTimeSlots();

    return (
      <div className="overflow-x-auto">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateWeek("prev")}
              className="p-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md flex items-center shadow-sm"
            >
              <FaArrowLeft className="mr-1" /> Previous
            </motion.button>

            <h3 className="font-medium bg-blue-50 px-4 py-2 rounded-md border border-blue-100 text-blue-800">
              <span className="hidden sm:inline">Week of </span>
              {weekStartDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(
                weekStartDate.getTime() + 5 * 24 * 60 * 60 * 1000
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </h3>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateWeek("next")}
              className="p-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md flex items-center shadow-sm"
            >
              Next <FaArrowRight className="ml-1" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode("list")}
            className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors border border-blue-100"
          >
            <FaList className="mr-2" /> Switch to List View
          </motion.button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600">
                <th className="py-3 px-4 border-b border-r border-gray-200 text-left font-semibold">
                  <div className="flex items-center">
                    <FaClock className="mr-2 text-blue-500" /> Time
                  </div>
                </th>
                {weekDates.map((dayInfo, index) => (
                  <th
                    key={index}
                    className="py-3 px-4 border-b border-r border-gray-200 min-w-[150px]"
                  >
                    <div className="font-semibold text-blue-700">
                      {dayInfo.dayName}
                    </div>
                    <div className="text-xs font-normal text-gray-500">
                      {dayInfo.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeSlot, timeIndex) => (
                <tr
                  key={timeIndex}
                  className={timeIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-2 px-4 border-b border-r border-gray-200 font-medium text-gray-700">
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-gray-400 hidden sm:block" />
                      {formatTime(timeSlot)}
                    </div>
                  </td>

                  {weekDates.map((dayInfo, dayIndex) => {
                    const cellSchedules = getScheduleForDayAndTime(
                      dayInfo.dayName,
                      timeSlot
                    );

                    return (
                      <td
                        key={dayIndex}
                        className="py-1 px-2 border-b border-r border-gray-200 text-xs relative"
                      >
                        {cellSchedules.length > 0 ? (
                          <div className="space-y-2">
                            {cellSchedules.map((schedule, idx) => (
                              <motion.div
                                key={idx}
                                whileHover={{ scale: 1.01 }}
                                className={`p-2 rounded-md shadow-sm border ${
                                  schedule.subject === "Mathematics"
                                    ? "bg-blue-50 border-blue-200"
                                    : schedule.subject === "Physics"
                                    ? "bg-purple-50 border-purple-200"
                                    : schedule.subject === "Chemistry"
                                    ? "bg-green-50 border-green-200"
                                    : schedule.subject === "Biology"
                                    ? "bg-red-50 border-red-200"
                                    : schedule.subject === "English"
                                    ? "bg-yellow-50 border-yellow-200"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                              >
                                <div className="font-bold text-gray-800">
                                  {schedule.subject}
                                </div>
                                <div className="text-gray-700 flex items-center">
                                  <FaSchool
                                    className="mr-1 text-gray-500"
                                    size={10}
                                  />
                                  {schedule.class}
                                </div>
                                <div className="text-gray-600 flex items-center">
                                  <FaChalkboardTeacher
                                    className="mr-1 text-gray-500"
                                    size={10}
                                  />
                                  {schedule.teacherName}
                                </div>
                                {schedule.batch && (
                                  <span className="inline-block px-2 py-0.5 mt-1 bg-blue-100 text-blue-800 rounded-full text-xs border border-blue-200">
                                    {schedule.batch}
                                  </span>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-12 w-full flex items-center justify-center text-gray-300">
                            -
                          </div>
                        )}
                        ;
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Detect if the screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Mobile-specific header with compact controls
  const renderMobileHeader = () => (
    <div className="flex flex-col space-y-3 mb-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <FaCalendarAlt className="mr-2 text-blue-600" /> Schedule
        </h2>
        <button
          onClick={() => setViewMode(viewMode === "list" ? "table" : "list")}
          className="p-2 bg-blue-100 text-blue-700 rounded-md flex items-center"
        >
          {viewMode === "list" ? <FaTable size={14} /> : <FaList size={14} />}
        </button>
      </div>

      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <FaSearch
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full"
          />
        </div>

        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="pl-2 pr-6 py-2 border border-gray-300 rounded-md text-sm appearance-none"
          style={{ minWidth: "90px" }}
        >
          <option value="">All Days</option>
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>

      {nextClass && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
          <div className="text-sm font-medium text-blue-800">Next Class:</div>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-blue-900">
                {nextClass.subject}
              </div>
              <div className="text-xs text-blue-700">
                {formatTime(nextClass.startTime)} -{" "}
                {formatTime(nextClass.endTime)}
              </div>
            </div>
            <div className="bg-blue-200 text-blue-800 rounded-full px-3 py-1 text-xs">
              {nextClass.teacherName}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile-specific table view
  const renderMobileTableView = () => {
    const weekDates = generateWeekDates(weekStartDate);
    const timeSlots = getUniqueTimeSlots();
    const activeDay = weekDates[activeDayIndex]; // Moved to component level

    return (
      <div>
        {/* Day selector tabs */}
        <div className="mb-4 overflow-x-auto py-1">
          <div className="flex space-x-1 min-w-max">
            {weekDates.map((dayInfo, index) => (
              <button
                key={index}
                onClick={() => setActiveDayIndex(index)}
                className={`px-3 py-2 rounded-md min-w-[80px] ${
                  activeDayIndex === index
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <div className="text-sm font-medium">{dayInfo.dayName}</div>
                <div className="text-xs opacity-80">
                  {dayInfo.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation controls */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigateWeek("prev")}
            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm"
          >
            <FaArrowLeft size={12} /> Prev Week
          </button>

          <button
            onClick={() => navigateWeek("next")}
            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm"
          >
            Next Week <FaArrowRight size={12} />
          </button>
        </div>

        {/* Time slot cards for the selected day */}
        <div className="space-y-3">
          {timeSlots.map((timeSlot, timeIndex) => {
            const daySchedules = getScheduleForDayAndTime(
              activeDay.dayName,
              timeSlot
            );

            if (daySchedules.length === 0) {
              return null; // Don't show empty time slots
            }

            return (
              <motion.div
                key={timeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 font-medium text-gray-700 flex items-center">
                  <FaClock className="mr-2 text-blue-500" size={14} />
                  {formatTime(timeSlot)}
                </div>

                <div className="divide-y divide-gray-100">
                  {daySchedules.map((schedule, idx) => (
                    <div
                      key={idx}
                      className={`p-3 ${
                        schedule.subject === "Mathematics"
                          ? "bg-blue-50"
                          : schedule.subject === "Physics"
                          ? "bg-purple-50"
                          : schedule.subject === "Chemistry"
                          ? "bg-green-50"
                          : schedule.subject === "Biology"
                          ? "bg-red-50"
                          : schedule.subject === "English"
                          ? "bg-yellow-50"
                          : "bg-white"
                      }`}
                    >
                      <div className="font-medium text-gray-800">
                        {schedule.subject}
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <div className="text-gray-600">
                          {schedule.teacherName}
                        </div>
                        {schedule.batch && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {schedule.batch}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {!timeSlots.some(
            (timeSlot) =>
              getScheduleForDayAndTime(activeDay.dayName, timeSlot).length > 0
          ) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
              No classes scheduled for {activeDay.dayName}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Mobile-specific list view
  const renderMobileListView = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {Object.entries(schedulesByDay)
        .sort(([dayA], [dayB]) => {
          const dayOrder = {
            Monday: 0,
            Tuesday: 1,
            Wednesday: 2,
            Thursday: 3,
            Friday: 4,
            Saturday: 5,
          };
          return (dayOrder[dayA] || 99) - (dayOrder[dayB] || 99);
        })
        .map(([day, daySchedules]) => (
          <motion.div
            key={day}
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          >
            <div
              className={`px-3 py-2 text-white ${
                day === today
                  ? "bg-gradient-to-r from-green-600 to-green-700"
                  : "bg-gradient-to-r from-blue-600 to-blue-700"
              }`}
            >
              <h3 className="text-base font-semibold flex items-center">
                {day === today && (
                  <FaRegCalendarCheck className="mr-2" size={14} />
                )}
                {day}
                {day === today && (
                  <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded">
                    Today
                  </span>
                )}
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {daySchedules.map((schedule) => (
                <motion.div
                  key={schedule.id}
                  variants={itemVariants}
                  className={`p-3 ${
                    day === today ? "hover:bg-green-50" : "hover:bg-blue-50"
                  } transition-colors`}
                >
                  <div className="flex items-center mb-1">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        schedule.subject === "Mathematics"
                          ? "bg-blue-500"
                          : schedule.subject === "Physics"
                          ? "bg-purple-500"
                          : schedule.subject === "Chemistry"
                          ? "bg-green-500"
                          : schedule.subject === "Biology"
                          ? "bg-red-500"
                          : schedule.subject === "English"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <h4 className="text-base font-medium text-gray-800">
                      {schedule.subject}
                    </h4>
                    {schedule.batch && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {schedule.batch}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-y-1 text-sm pl-4">
                    <div className="flex items-center text-gray-600">
                      <FaClock className="mr-1 text-blue-500" size={12} />
                      <span>
                        {formatTime(schedule.startTime)} -{" "}
                        {formatTime(schedule.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaChalkboardTeacher
                        className="mr-1 text-blue-500"
                        size={12}
                      />
                      <span>{schedule.teacherName}</span>
                    </div>
                    {schedule.roomNumber && (
                      <div className="flex items-center text-gray-600">
                        <FaBook className="mr-1 text-blue-500" size={12} />
                        <span>Room {schedule.roomNumber}</span>
                      </div>
                    )}
                  </div>

                  {schedule.notes && (
                    <p className="mt-2 text-xs text-gray-500 italic pl-4">
                      Note: {schedule.notes}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
    </motion.div>
  );

  // Update the main render function to use mobile views on smaller screens
  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-7xl mx-auto">
      {isMobile ? (
        renderMobileHeader()
      ) : (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          {/* Original desktop header */}
          <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4 md:mb-0">
            <FaCalendarAlt className="mr-2 text-blue-600" /> Class Schedule
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>

            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Days</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                setViewMode(viewMode === "list" ? "table" : "list")
              }
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              {viewMode === "list" ? (
                <>
                  <FaTable className="mr-2" /> Table View
                </>
              ) : (
                <>
                  <FaList className="mr-2" /> List View
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Today's Schedule Highlight (Only on desktop or mobile list view) */}
      {todaySchedules.length > 0 &&
        !selectedDay &&
        (viewMode === "list" || !isMobile) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-blue-50 rounded-lg p-4 border border-blue-200"
          >
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <FaRegCalendarCheck className="mr-2" /> Today's Schedule ({today})
            </h3>

            {nextClass ? (
              <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                <div className="bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center">
                  <FaClock className="text-xl" />
                </div>
                <div>
                  <div className="font-medium text-blue-900">Next Class:</div>
                  <div className="text-lg font-semibold text-blue-800">
                    {nextClass.subject}
                    <span className="ml-2 text-sm font-normal text-blue-600">
                      ({formatTime(nextClass.startTime)} -{" "}
                      {formatTime(nextClass.endTime)})
                    </span>
                  </div>
                  <div className="text-sm text-blue-600 flex items-center">
                    <FaChalkboardTeacher className="mr-1" />{" "}
                    {nextClass.teacherName}
                    {nextClass.roomNumber && (
                      <span className="ml-3">Room: {nextClass.roomNumber}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg border border-blue-100 text-blue-700">
                No more classes scheduled for today.
              </div>
            )}
          </motion.div>
        )}

      {/* Schedule Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-blue-600 font-medium text-sm">
            Loading schedules...
          </span>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center"
        >
          <FaCalendarAlt
            className={`text-gray-400 ${
              isMobile ? "text-4xl" : "text-5xl"
            } mx-auto mb-4`}
          />
          <h3
            className={`${
              isMobile ? "text-lg" : "text-xl"
            } font-medium text-gray-600 mb-2`}
          >
            No Schedules Found
          </h3>
          <p className={`text-gray-500 ${isMobile ? "text-sm" : ""}`}>
            {searchTerm || selectedDay
              ? "No schedules match your current filters."
              : userRole === "student"
              ? "No schedules have been created for your class yet."
              : "No schedules have been created yet."}
          </p>
        </motion.div>
      ) : isMobile ? (
        viewMode === "table" ? (
          renderMobileTableView()
        ) : (
          renderMobileListView()
        )
      ) : viewMode === "table" ? (
        renderTableView()
      ) : (
        // Original desktop list view
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {Object.entries(schedulesByDay)
            .sort(([dayA], [dayB]) => {
              const dayOrder = {
                Monday: 0,
                Tuesday: 1,
                Wednesday: 2,
                Thursday: 3,
                Friday: 4,
                Saturday: 5,
              };
              return (dayOrder[dayA] || 99) - (dayOrder[dayB] || 99);
            })
            .map(([day, daySchedules]) => (
              <motion.div
                key={day}
                variants={itemVariants}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                <div
                  className={`px-4 py-3 text-white ${
                    day === today
                      ? "bg-gradient-to-r from-green-600 to-green-700"
                      : "bg-gradient-to-r from-blue-600 to-blue-700"
                  }`}
                >
                  <h3 className="text-lg font-semibold flex items-center">
                    {day === today && <FaRegCalendarCheck className="mr-2" />}
                    {day}
                    {day === today && (
                      <span className="ml-2 text-sm bg-white bg-opacity-20 px-2 py-0.5 rounded">
                        Today
                      </span>
                    )}
                  </h3>
                </div>

                <div className="divide-y divide-gray-200">
                  {daySchedules.map((schedule) => (
                    <motion.div
                      key={schedule.id}
                      variants={itemVariants}
                      className={`p-4 ${
                        day === today ? "hover:bg-green-50" : "hover:bg-blue-50"
                      } transition-colors`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${
                                schedule.subject === "Mathematics"
                                  ? "bg-blue-500"
                                  : schedule.subject === "Physics"
                                  ? "bg-purple-500"
                                  : schedule.subject === "Chemistry"
                                  ? "bg-green-500"
                                  : schedule.subject === "Biology"
                                  ? "bg-red-500"
                                  : schedule.subject === "English"
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                              }`}
                            ></div>
                            <h4 className="text-lg font-medium text-gray-800">
                              {schedule.subject}
                            </h4>
                            {schedule.batch && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                {schedule.batch}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div className="flex items-center text-gray-600">
                              <FaClock className="mr-1 text-blue-500" />
                              <span>
                                {formatTime(schedule.startTime)} -{" "}
                                {formatTime(schedule.endTime)}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <FaChalkboardTeacher className="mr-1 text-blue-500" />
                              <span>{schedule.teacherName}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <FaSchool className="mr-1 text-blue-500" />
                              <span>{schedule.class}</span>
                            </div>
                            {schedule.roomNumber && (
                              <div className="flex items-center text-gray-600">
                                <FaBook className="mr-1 text-blue-500" />
                                <span>Room {schedule.roomNumber}</span>
                              </div>
                            )}
                          </div>

                          {schedule.notes && (
                            <p className="mt-2 text-sm text-gray-500 italic">
                              Note: {schedule.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
        </motion.div>
      )}
    </div>
  );
};

export default ScheduleDisplay;
