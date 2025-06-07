/* eslint-disable no-undef */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaFilter,
  FaChevronDown,
  FaSave,
  FaClock,
  FaChalkboardTeacher,
  FaBook,
  FaSchool,
  FaCalendarWeek,
  FaRegCalendarAlt,
  FaTable,
  FaList,
  FaSearch,
  FaCalendarDay,
  FaCalendarCheck,
  FaLock,
  FaUserShield,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaArrowRight,
  FaUser,
  FaBell,
  FaBan,
  FaEye,
  FaEyeSlash,
  FaClipboardList,
  FaSyncAlt,
  FaIdBadge,
  FaHistory,
  FaClipboardCheck,
} from "react-icons/fa";

// Enhanced animation variants for smoother transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.3 },
  },
};

// Modal animation variants for smoother appearance
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

// Button hover effect
const buttonHoverEffect = {
  scale: 1.03,
  transition: { duration: 0.2 },
};

const buttonTapEffect = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

const ScheduleManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [isWeekWiseMode, setIsWeekWiseMode] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "table"
  const [filterExpanded, setFilterExpanded] = useState(true);
  const [weekStartDate, setWeekStartDate] = useState(getStartOfWeek());
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);

  const [formData, setFormData] = useState({
    class: "",
    day: "",
    date: "",
    batch: "",
    subject: "",
    startTime: "",
    endTime: "",
    teacherName: "",
    roomNumber: "",
    notes: "",
  });

  // For week-wise scheduling
  const [selectedDays, setSelectedDays] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userRole = localStorage.getItem("userRole");
  const userName =
    localStorage.getItem("studentName") ||
    localStorage.getItem("teacherName") ||
    "";

  // Subject options
  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Social Science",
    "Computer Science",
    "Hindi",
    "Gujarati",
    "Physical Education",
  ];

  // Day options
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Class options
  const classes = ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];

  // Batch options
  const batches = ["Lakshya", "Aadharshila", "Basic", "General"];

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

  // Create weekly schedule time slots (between 7 AM and 9 PM in 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour < 21; hour++) {
      for (let minute of [0, 30]) {
        const hourFormatted = hour.toString().padStart(2, "0");
        const minuteFormatted = minute.toString().padStart(2, "0");
        slots.push(`${hourFormatted}:${minuteFormatted}`);
      }
    }
    return slots;
  };

  // Filter schedules to get unique time slots that actually have classes
  useEffect(() => {
    if (schedules.length > 0) {
      // Get all unique start times from schedules
      const timeSet = new Set();
      schedules.forEach((schedule) => {
        if (schedule.startTime) timeSet.add(schedule.startTime);
      });

      // Convert to array and sort
      const sortedTimes = Array.from(timeSet).sort();
      setFilteredTimeSlots(sortedTimes);
    } else {
      // Use default time slots if no schedules
      setFilteredTimeSlots(generateTimeSlots());
    }
  }, [schedules]);

  // Using onSnapshot for real-time updates
  useEffect(() => {
    const fetchSchedules = () => {
      try {
        setLoading(true);
        const scheduleRef = collection(db, "Schedule");

        // Create a query based on filters
        let scheduleQuery = scheduleRef;

        const filterConditions = [];

        if (selectedClass)
          filterConditions.push(where("class", "==", selectedClass));
        if (selectedDay) filterConditions.push(where("day", "==", selectedDay));
        if (selectedBatch)
          filterConditions.push(where("batch", "==", selectedBatch));
        if (selectedDate)
          filterConditions.push(where("date", "==", selectedDate));

        if (filterConditions.length > 0) {
          scheduleQuery = query(scheduleRef, ...filterConditions);
        }

        const unsubscribe = onSnapshot(
          scheduleQuery,
          (snapshot) => {
            const fetchedSchedules = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Sort by date first, then by day of week, then by start time
            fetchedSchedules.sort((a, b) => {
              // First sort by date if available
              if (a.date && b.date) {
                const dateCompare = new Date(a.date) - new Date(b.date);
                if (dateCompare !== 0) return dateCompare;
              }

              // Then sort by day of week
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
  }, [selectedClass, selectedDay, selectedBatch, selectedDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDayCheckboxChange = (day) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const validateForm = () => {
    if (!formData.class) return "Class is required";
    if (!isWeekWiseMode && !formData.day && !formData.date)
      return "Either day or specific date is required";
    if (isWeekWiseMode && !Object.values(selectedDays).some((day) => day))
      return "At least one day must be selected in week-wise mode";
    if (!formData.subject) return "Subject is required";
    if (!formData.startTime) return "Start time is required";
    if (!formData.endTime) return "End time is required";
    if (!formData.teacherName) return "Teacher name is required";

    // Check if end time is after start time
    const startTime = formData.startTime.split(":").map(Number);
    const endTime = formData.endTime.split(":").map(Number);

    if (
      startTime[0] > endTime[0] ||
      (startTime[0] === endTime[0] && startTime[1] >= endTime[1])
    ) {
      return "End time must be after start time";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      if (!isWeekWiseMode) {
        // Single schedule creation
        const scheduleId =
          isEditMode && currentSchedule
            ? currentSchedule.id
            : `${formData.class.replace(/\s+/g, "")}_${
                formData.day || formData.date
              }_${formData.subject.replace(
                /\s+/g,
                ""
              )}_${formData.startTime.replace(":", "")}`;

        const scheduleData = {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: userName,
        };

        if (!isEditMode) {
          scheduleData.createdAt = serverTimestamp();
          scheduleData.createdBy = userName;
          await setDoc(doc(db, "Schedule", scheduleId), scheduleData);
          setSuccess("Schedule created successfully!");
        } else {
          await updateDoc(doc(db, "Schedule", scheduleId), scheduleData);
          setSuccess("Schedule updated successfully!");
        }
      } else {
        // Week-wise scheduling (create multiple schedules)
        const selectedDaysList = Object.keys(selectedDays).filter(
          (day) => selectedDays[day]
        );

        for (const day of selectedDaysList) {
          const scheduleId = `${formData.class.replace(
            /\s+/g,
            ""
          )}_${day}_${formData.subject.replace(
            /\s+/g,
            ""
          )}_${formData.startTime.replace(":", "")}`;

          const scheduleData = {
            ...formData,
            day: day,
            updatedAt: serverTimestamp(),
            updatedBy: userName,
            createdAt: serverTimestamp(),
            createdBy: userName,
          };

          await setDoc(doc(db, "Schedule", scheduleId), scheduleData);
        }

        setSuccess(
          `Created ${selectedDaysList.length} schedules successfully!`
        );
      }

      closeModal();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving schedule:", error);
      setError(
        `Failed to ${isEditMode ? "update" : "create"} schedule: ${
          error.message
        }`
      );
      setTimeout(() => setError(""), 5000);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setIsWeekWiseMode(false);
    setFormData({
      class: selectedClass || "",
      day: selectedDay || "",
      date: "",
      batch: selectedBatch || "",
      subject: "",
      startTime: "",
      endTime: "",
      teacherName: "",
      roomNumber: "",
      notes: "",
    });
    setSelectedDays({
      Monday: false,
      Tuesday: false,
      Wednesday: false,
      Thursday: false,
      Friday: false,
      Saturday: false,
    });
    setIsModalOpen(true);
  };

  const openWeekWiseModal = () => {
    setIsEditMode(false);
    setIsWeekWiseMode(true);
    setFormData({
      class: selectedClass || "",
      day: "",
      date: "",
      batch: selectedBatch || "",
      subject: "",
      startTime: "",
      endTime: "",
      teacherName: "",
      roomNumber: "",
      notes: "",
    });
    setSelectedDays({
      Monday: false,
      Tuesday: false,
      Wednesday: false,
      Thursday: false,
      Friday: false,
      Saturday: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (schedule) => {
    setIsEditMode(true);
    setIsWeekWiseMode(false);
    setCurrentSchedule(schedule);
    setFormData({
      class: schedule.class || "",
      day: schedule.day || "",
      date: schedule.date || "",
      batch: schedule.batch || "",
      subject: schedule.subject || "",
      startTime: schedule.startTime || "",
      endTime: schedule.endTime || "",
      teacherName: schedule.teacherName || "",
      roomNumber: schedule.roomNumber || "",
      notes: schedule.notes || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSchedule(null);
    setIsWeekWiseMode(false);
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "Schedule", id));
      setSuccess("Schedule deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting schedule:", error);
      setError("Failed to delete schedule: " + error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  // Group schedules by day or date
  const groupSchedules = () => {
    return schedules.reduce((acc, schedule) => {
      // If schedule has a date, use the formatted date as the key
      const key = schedule.date
        ? new Date(schedule.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : schedule.day || "Unspecified";

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(schedule);
      return acc;
    }, {});
  };

  const schedulesGrouped = groupSchedules();

  // Format time to 12-hour format
  const formatTime = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${suffix}`;
  };

  // Format time range for displaying (Start-end format)
  const formatTimeRange = (startTime, endTime) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Format time for displaying in the table
  const formatTimeForDisplay = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${suffix}`;
  };

  // Function to calculate end time from a start time (assuming 30-minute slots)
  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    let endHours = hours;
    let endMinutes = minutes + 30;

    if (endMinutes >= 60) {
      endHours++;
      endMinutes -= 60;
    }

    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Format time slot as a range for table view
  const formatTimeSlotRange = (timeSlot) => {
    const endTime = calculateEndTime(timeSlot);
    return formatTimeRange(timeSlot, endTime);
  };

  // Check if user is an admin
  const isAdmin = userRole === "admin";

  // Function to get schedule for a specific day and time
  const getScheduleForDayAndTime = (day, time, dateStr = null) => {
    return schedules.filter((schedule) => {
      if (dateStr && schedule.date) {
        // For specific date
        return schedule.date === dateStr && schedule.startTime === time;
      } else {
        // For day of week
        return (
          schedule.day === day && schedule.startTime === time && !schedule.date
        );
      }
    });
  };

  // Function to format date as YYYY-MM-DD (for internal use)
  const formatDateToString = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Handle quick filter selections
  const handleQuickFilter = (filter) => {
    const today = new Date();

    switch (filter) {
      case "today":
        setSelectedDate(formatDateToString(today));
        setSelectedDay(days[today.getDay() === 0 ? 6 : today.getDay() - 1]);
        break;
      case "tomorrow":
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        setSelectedDate(formatDateToString(tomorrow));
        setSelectedDay(
          days[tomorrow.getDay() === 0 ? 6 : tomorrow.getDay() - 1]
        );
        break;
      case "thisWeek":
        setSelectedDate("");
        setWeekStartDate(getStartOfWeek());
        setViewMode("table");
        break;
      case "nextWeek":
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        setSelectedDate("");
        setWeekStartDate(getStartOfWeek(nextWeek));
        setViewMode("table");
        break;
      default:
        break;
    }
  };

  // Navigate to previous/next week
  const navigateWeek = (direction) => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setWeekStartDate(newDate);
  };

  // Render enhanced header with better visual design
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-center mb-8">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4 md:mb-0">
        <div className="bg-blue-600 p-2 rounded-lg shadow-md text-white mr-3">
          <FaCalendarAlt size={20} />
        </div>
        <div>
          <span className="text-blue-700">Schedule</span>{" "}
          <span className="text-gray-700">Management</span>
        </div>
      </h2>
      <div className="flex flex-wrap gap-2 justify-center md:justify-end">
        <motion.button
          whileHover={buttonHoverEffect}
          whileTap={buttonTapEffect}
          onClick={() => setViewMode(viewMode === "list" ? "table" : "list")}
          className={`px-4 py-2.5 rounded-lg shadow flex items-center transition-all ${
            viewMode === "list"
              ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
              : "bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
          }`}
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
        </motion.button>
        <motion.button
          whileHover={buttonHoverEffect}
          whileTap={buttonTapEffect}
          onClick={openWeekWiseModal}
          className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg shadow flex items-center"
        >
          <FaCalendarWeek className="mr-2" /> Week-wise Schedule
        </motion.button>
        <motion.button
          whileHover={buttonHoverEffect}
          whileTap={buttonTapEffect}
          onClick={openAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow flex items-center"
        >
          <FaPlus className="mr-2" /> Add Schedule
        </motion.button>
      </div>
    </div>
  );

  // Enhanced notification display
  const renderNotifications = () => (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md shadow-sm flex items-start"
        >
          <div className="text-red-500 mr-3 flex-shrink-0">
            <FaExclamationTriangle size={20} />
          </div>
          <div className="text-red-800">{error}</div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md shadow-sm flex items-start"
        >
          <div className="text-green-500 mr-3 flex-shrink-0">
            <FaCheckCircle size={20} />
          </div>
          <div className="text-green-800">{success}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Enhanced filter panel with improved UX
  const renderFilterPanel = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl mb-6 border border-gray-200 overflow-hidden shadow-md"
    >
      <div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 flex justify-between items-center cursor-pointer border-b border-gray-200"
        onClick={() => setFilterExpanded(!filterExpanded)}
      >
        <h3 className="text-lg font-medium text-gray-700 flex items-center">
          <div className="bg-blue-100 p-1.5 rounded-md text-blue-600 mr-2">
            <FaFilter size={16} />
          </div>
          Filter Schedules
        </h3>
        <motion.div
          animate={{ rotate: filterExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown className="text-gray-500" />
        </motion.div>
      </div>

      <AnimatePresence>
        {filterExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5"
          >
            <div className="mb-5">
              <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
                <FaCalendarCheck className="mr-2 text-blue-500" /> Quick Filters
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickFilter("today")}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm flex items-center transition-colors border border-blue-100"
                >
                  <FaCalendarDay className="mr-1.5" /> Today
                </button>
                <button
                  onClick={() => handleQuickFilter("tomorrow")}
                  className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-sm flex items-center transition-colors border border-purple-100"
                >
                  <FaCalendarCheck className="mr-1.5" /> Tomorrow
                </button>
                <button
                  onClick={() => handleQuickFilter("thisWeek")}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-sm flex items-center transition-colors border border-indigo-100"
                >
                  <FaCalendarWeek className="mr-1.5" /> This Week
                </button>
                <button
                  onClick={() => handleQuickFilter("nextWeek")}
                  className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-sm flex items-center transition-colors border border-green-100"
                >
                  <FaCalendarWeek className="mr-1.5" /> Next Week
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Class
                </label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pl-3 pr-10"
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <FaChevronDown size={12} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Day
                </label>
                <div className="relative">
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pl-3 pr-10"
                  >
                    <option value="">All Days</option>
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <FaChevronDown size={12} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Batch
                </label>
                <div className="relative">
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pl-3 pr-10"
                  >
                    <option value="">All Batches</option>
                    {batches.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <FaChevronDown size={12} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Specific Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <FaRegCalendarAlt size={14} />
                  </div>
                </div>
              </div>
            </div>

            {(selectedClass ||
              selectedDay ||
              selectedBatch ||
              selectedDate) && (
              <div className="mt-4 flex justify-end">
                <motion.button
                  whileHover={buttonHoverEffect}
                  whileTap={buttonTapEffect}
                  onClick={() => {
                    setSelectedClass("");
                    setSelectedDay("");
                    setSelectedBatch("");
                    setSelectedDate("");
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center transition-colors"
                >
                  <FaTimes className="mr-1.5" /> Clear Filters
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Enhanced table view with better styling and interactions
  const renderEnhancedScheduleTable = () => {
    const weekDates = generateWeekDates(weekStartDate);

    return (
      <div className="overflow-x-auto">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <motion.button
              whileHover={buttonHoverEffect}
              whileTap={buttonTapEffect}
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
              whileHover={buttonHoverEffect}
              whileTap={buttonTapEffect}
              onClick={() => navigateWeek("next")}
              className="p-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md flex items-center shadow-sm"
            >
              Next <FaArrowRight className="ml-1" />
            </motion.button>
          </div>

          <motion.button
            whileHover={buttonHoverEffect}
            whileTap={buttonTapEffect}
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
              {filteredTimeSlots.map((timeSlot, timeIndex) => (
                <tr
                  key={timeIndex}
                  className={timeIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-2 px-4 border-b border-r border-gray-200 font-medium text-gray-700">
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-gray-400 hidden sm:block" />
                      {formatTimeSlotRange(timeSlot)}
                    </div>
                  </td>

                  {weekDates.map((dayInfo, dayIndex) => {
                    const dateStr = formatDateToString(dayInfo.date);
                    const daySchedules = getScheduleForDayAndTime(
                      dayInfo.dayName,
                      timeSlot
                    );
                    const dateSchedules = getScheduleForDayAndTime(
                      null,
                      timeSlot,
                      dateStr
                    );
                    const cellSchedules = [...dateSchedules, ...daySchedules];

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
                                  <FaUser
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
                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                  <FaClock className="mr-1" size={10} />
                                  {formatTimeRange(
                                    schedule.startTime,
                                    schedule.endTime
                                  )}
                                </div>
                                <div className="flex mt-2 space-x-1 border-t border-gray-200 pt-1">
                                  <button
                                    onClick={() => openEditModal(schedule)}
                                    className="p-1 text-xs text-blue-600 hover:bg-blue-100 rounded transition-colors flex-1 flex justify-center items-center"
                                    title="Edit"
                                  >
                                    <FaEdit className="mr-1" size={10} /> Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteSchedule(schedule.id)
                                    }
                                    className="p-1 text-xs text-red-600 hover:bg-red-100 rounded transition-colors flex-1 flex justify-center items-center"
                                    title="Delete"
                                  >
                                    <FaTrash className="mr-1" size={10} />{" "}
                                    Delete
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="h-12 w-full flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-500 cursor-pointer rounded-md border border-transparent hover:border-blue-200 transition-all"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                day: dayInfo.dayName,
                                date: dateStr,
                                startTime: timeSlot,
                                endTime: calculateEndTime(timeSlot),
                              });
                              openAddModal();
                            }}
                          >
                            <FaPlus size={12} />
                          </motion.div>
                        )}
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

  // Enhanced list view with better styling
  const renderEnhancedScheduleList = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {Object.entries(schedulesGrouped)
        .sort(([keyA], [keyB]) => {
          // Sort by date if it's a date string
          if (keyA.includes(",") && keyB.includes(",")) {
            return new Date(keyA) - new Date(keyB);
          }

          // Sort by day of week
          const dayOrder = {
            Monday: 0,
            Tuesday: 1,
            Wednesday: 2,
            Thursday: 3,
            Friday: 4,
            Saturday: 5,
          };
          return (dayOrder[keyA] || 99) - (dayOrder[keyB] || 99);
        })
        .map(([groupKey, groupSchedules]) => (
          <motion.div
            key={groupKey}
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 text-white flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <FaCalendarDay className="mr-2" /> {groupKey}
              </h3>
              <span className="bg-white bg-opacity-20 py-1 px-3 rounded-full text-sm">
                {groupSchedules.length}{" "}
                {groupSchedules.length === 1 ? "class" : "classes"}
              </span>
            </div>

            <div className="divide-y divide-gray-200">
              {groupSchedules.map((schedule) => (
                <motion.div
                  key={schedule.id}
                  variants={itemVariants}
                  className="p-5 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div
                          className={`w-3 h-10 rounded-md mr-3 ${
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
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {schedule.subject}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            {schedule.batch && (
                              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs border border-blue-200">
                                {schedule.batch}
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs border border-gray-200">
                              {schedule.class}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm ml-6">
                        <div className="flex items-center text-gray-700">
                          <div className="bg-blue-100 p-1.5 rounded-full text-blue-600 mr-2">
                            <FaClock size={14} />
                          </div>
                          <span>
                            {formatTimeRange(
                              schedule.startTime,
                              schedule.endTime
                            )}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div className="bg-green-100 p-1.5 rounded-full text-green-600 mr-2">
                            <FaChalkboardTeacher size={14} />
                          </div>
                          <span>{schedule.teacherName}</span>
                        </div>

                        {schedule.roomNumber && (
                          <div className="flex items-center text-gray-700">
                            <div className="bg-purple-100 p-1.5 rounded-full text-purple-600 mr-2">
                              <FaBook size={14} />
                            </div>
                            <span>Room {schedule.roomNumber}</span>
                          </div>
                        )}
                        {schedule.date && (
                          <div className="flex items-center text-gray-700">
                            <div className="bg-orange-100 p-1.5 rounded-full text-orange-600 mr-2">
                              <FaRegCalendarAlt size={14} />
                            </div>
                            <span>
                              Date:{" "}
                              {new Date(schedule.date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {schedule.notes && (
                        <div className="mt-3 ml-6 p-3 bg-yellow-50 border-l-2 border-yellow-300 text-sm text-gray-700 rounded">
                          <div className="flex items-start">
                            <FaInfoCircle className="text-yellow-500 mt-0.5 mr-2" />
                            <p>{schedule.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mt-4 md:mt-0 ml-6 md:ml-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(schedule)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Edit"
                      >
                        <FaEdit size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title="Delete"
                      >
                        <FaTrash size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
    </motion.div>
  );

  // Mobile-specific table view for better visibility on small screens
  const renderMobileScheduleTable = () => {
    const weekDates = generateWeekDates(weekStartDate);

    return (
      <div className="overflow-x-hidden">
        <div className="mb-6 flex flex-col items-center justify-between">
          <div className="flex items-center space-x-3 mb-4">
            <motion.button
              whileHover={buttonHoverEffect}
              whileTap={buttonTapEffect}
              onClick={() => navigateWeek("prev")}
              className="p-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md flex items-center shadow-sm"
            >
              <FaArrowLeft className="mr-1" /> Prev
            </motion.button>

            <h3 className="font-medium bg-blue-50 px-3 py-2 rounded-md border border-blue-100 text-blue-800 text-sm">
              {weekStartDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              {" - "}
              {new Date(
                weekStartDate.getTime() + 5 * 24 * 60 * 60 * 1000
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </h3>

            <motion.button
              whileHover={buttonHoverEffect}
              whileTap={buttonTapEffect}
              onClick={() => navigateWeek("next")}
              className="p-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md flex items-center shadow-sm"
            >
              Next <FaArrowRight className="ml-1" />
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => setViewMode("list")}
              className="flex items-center justify-center text-blue-600 bg-blue-50 px-3 py-2 rounded-md transition-colors border border-blue-100"
            >
              <FaList className="mr-2" /> List View
            </button>

            <button
              onClick={() => setSelectedDay("")}
              className="flex items-center justify-center text-green-600 bg-green-50 px-3 py-2 rounded-md transition-colors border border-green-100"
            >
              <FaCalendarDay className="mr-2" /> All Days
            </button>
          </div>
        </div>

        {/* Day tabs for mobile */}
        <div className="mb-4 overflow-x-auto py-2">
          <div className="flex space-x-1 min-w-max">
            {weekDates.map((dayInfo, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(dayInfo.dayName)}
                className={`px-3 py-2 rounded-md min-w-[90px] text-sm font-medium ${
                  selectedDay === dayInfo.dayName
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div>{dayInfo.dayName}</div>
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

        {/* Mobile-friendly schedule cards */}
        <div className="space-y-3">
          {filteredTimeSlots.map((timeSlot, timeIndex) => {
            // Show schedules for selected day or all days if none selected
            const dayToShow = selectedDay || weekDates[0].dayName;
            const dateStr = selectedDay
              ? formatDateToString(
                  weekDates.find((d) => d.dayName === dayToShow)?.date
                )
              : null;

            const daySchedules = getScheduleForDayAndTime(dayToShow, timeSlot);

            const dateSchedules = dateStr
              ? getScheduleForDayAndTime(null, timeSlot, dateStr)
              : [];

            const cellSchedules = [...dateSchedules, ...daySchedules];

            if (cellSchedules.length === 0 && selectedDay) {
              return null; // Don't show empty time slots in filtered view
            }

            return (
              <motion.div
                key={timeIndex}
                variants={itemVariants}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <div className="font-medium text-gray-700 flex items-center">
                    <FaClock className="mr-2 text-blue-500 text-sm" />
                    {formatTimeSlotRange(timeSlot)}
                  </div>

                  {cellSchedules.length === 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          day: dayToShow,
                          startTime: timeSlot,
                          endTime: calculateEndTime(timeSlot),
                        });
                        openAddModal();
                      }}
                      className="p-2 bg-blue-50 text-blue-600 rounded-md text-sm flex items-center"
                    >
                      <FaPlus size={12} className="mr-1" /> Add
                    </motion.button>
                  )}
                </div>

                <div className="divide-y divide-gray-100">
                  {cellSchedules.length > 0 ? (
                    cellSchedules.map((schedule, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.01 }}
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
                        <div className="font-semibold text-gray-800">
                          {schedule.subject}
                        </div>
                        <div className="text-gray-700 flex items-center text-sm">
                          <FaSchool className="mr-1 text-gray-500" size={12} />
                          {schedule.class}
                          {schedule.batch && (
                            <span className="ml-2 inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {schedule.batch}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-600 flex items-center text-sm">
                          <FaUser className="mr-1 text-gray-500" size={12} />
                          {schedule.teacherName}
                        </div>
                        <div className="flex mt-2 space-x-2 pt-1 border-t border-gray-200">
                          <button
                            onClick={() => openEditModal(schedule)}
                            className="p-2 text-xs bg-blue-100 text-blue-700 rounded flex-1 flex justify-center items-center"
                          >
                            <FaEdit className="mr-1" size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-2 text-xs bg-red-100 text-red-700 rounded flex-1 flex justify-center items-center"
                          >
                            <FaTrash className="mr-1" size={12} /> Delete
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-gray-500">
                      No classes scheduled
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // Mobile-specific list view
  const renderMobileScheduleList = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      {Object.entries(schedulesGrouped)
        .sort(([keyA], [keyB]) => {
          // Sort by date if it's a date string
          if (keyA.includes(",") && keyB.includes(",")) {
            return new Date(keyA) - new Date(keyB);
          }

          // Sort by day of week
          const dayOrder = {
            Monday: 0,
            Tuesday: 1,
            Wednesday: 2,
            Thursday: 3,
            Friday: 4,
            Saturday: 5,
          };
          return (dayOrder[keyA] || 99) - (dayOrder[keyB] || 99);
        })
        .map(([groupKey, groupSchedules]) => (
          <motion.div
            key={groupKey}
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-white">
              <h3 className="text-base font-semibold flex items-center justify-between">
                <div className="flex items-center">
                  <FaCalendarDay className="mr-2" /> {groupKey}
                </div>
                <span className="bg-white bg-opacity-20 py-1 px-2 rounded-full text-xs">
                  {groupSchedules.length}{" "}
                  {groupSchedules.length === 1 ? "class" : "classes"}
                </span>
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {groupSchedules.map((schedule) => (
                <motion.div
                  key={schedule.id}
                  variants={itemVariants}
                  className="p-3 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start">
                    <div
                      className={`w-2 h-full rounded-sm mr-2 ${
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
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-base font-medium text-gray-800">
                          {schedule.subject}
                        </h4>
                        <div className="flex gap-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(schedule)}
                            className="p-1.5 text-blue-600 bg-blue-50 rounded-md"
                          >
                            <FaEdit size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-1.5 text-red-600 bg-red-50 rounded-md"
                          >
                            <FaTrash size={14} />
                          </motion.button>
                        </div>
                      </div>

                      {schedule.batch && (
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs mb-1">
                          {schedule.batch}
                        </span>
                      )}

                      <div className="grid grid-cols-1 gap-y-1 text-sm mt-1">
                        <div className="flex items-center text-gray-700">
                          <div className="bg-blue-100 p-1 rounded-full text-blue-600 mr-2">
                            <FaClock size={12} />
                          </div>
                          <span>
                            {formatTimeRange(
                              schedule.startTime,
                              schedule.endTime
                            )}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div className="bg-green-100 p-1 rounded-full text-green-600 mr-2">
                            <FaChalkboardTeacher size={12} />
                          </div>
                          <span>{schedule.teacherName}</span>
                        </div>

                        <div className="flex items-center text-gray-700">
                          <div className="bg-purple-100 p-1 rounded-full text-purple-600 mr-2">
                            <FaSchool size={12} />
                          </div>
                          <span>{schedule.class}</span>
                        </div>
                      </div>

                      {schedule.notes && (
                        <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-300 text-xs text-gray-700 rounded">
                          <div className="flex items-start">
                            <FaInfoCircle
                              className="text-yellow-500 mt-0.5 mr-1 flex-shrink-0"
                              size={12}
                            />
                            <p>{schedule.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
    </motion.div>
  );

  // Mobile-specific filter panel
  const renderMobileFilterPanel = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl mb-4 border border-gray-200 overflow-hidden shadow-md"
    >
      <div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 flex justify-between items-center cursor-pointer border-b border-gray-200"
        onClick={() => setFilterExpanded(!filterExpanded)}
      >
        <h3 className="text-base font-medium text-gray-700 flex items-center">
          <div className="bg-blue-100 p-1.5 rounded-md text-blue-600 mr-2">
            <FaFilter size={14} />
          </div>
          Filters
        </h3>
        <motion.div
          animate={{ rotate: filterExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown className="text-gray-500" />
        </motion.div>
      </div>

      <AnimatePresence>
        {filterExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3"
          >
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                <FaCalendarCheck className="mr-1 text-blue-500" /> Quick Filters
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickFilter("today")}
                  className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm flex items-center justify-center border border-blue-100"
                >
                  <FaCalendarDay className="mr-1.5" /> Today
                </button>
                <button
                  onClick={() => handleQuickFilter("tomorrow")}
                  className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-sm flex items-center justify-center border border-purple-100"
                >
                  <FaCalendarCheck className="mr-1.5" /> Tomorrow
                </button>
                <button
                  onClick={() => handleQuickFilter("thisWeek")}
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-sm flex items-center justify-center border border-indigo-100"
                >
                  <FaCalendarWeek className="mr-1.5" /> This Week
                </button>
                <button
                  onClick={() => handleQuickFilter("nextWeek")}
                  className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-sm flex items-center justify-center border border-green-100"
                >
                  <FaCalendarWeek className="mr-1.5" /> Next Week
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Class
                </label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Day
                </label>
                <div className="relative">
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Days</option>
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Batch
                </label>
                <div className="relative">
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Batches</option>
                    {batches.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Specific Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {(selectedClass ||
              selectedDay ||
              selectedBatch ||
              selectedDate) && (
              <div className="mt-3 flex justify-end">
                <motion.button
                  whileHover={buttonHoverEffect}
                  whileTap={buttonTapEffect}
                  onClick={() => {
                    setSelectedClass("");
                    setSelectedDay("");
                    setSelectedBatch("");
                    setSelectedDate("");
                  }}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs flex items-center"
                >
                  <FaTimes className="mr-1" /> Clear Filters
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Enhanced form with better UI in modal
  const renderScheduleForm = () => (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${
              isMobile ? "max-w-full" : "max-w-2xl"
            }`}
          >
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                  {isWeekWiseMode ? (
                    <>
                      <div className="bg-green-100 p-2 rounded-md text-green-600 mr-3">
                        <FaCalendarWeek />
                      </div>
                      Week-wise Scheduling
                    </>
                  ) : isEditMode ? (
                    <>
                      <div className="bg-blue-100 p-2 rounded-md text-blue-600 mr-3">
                        <FaEdit />
                      </div>
                      Edit Schedule
                    </>
                  ) : (
                    <>
                      <div className="bg-blue-100 p-2 rounded-md text-blue-600 mr-3">
                        <FaPlus />
                      </div>
                      Add New Schedule
                    </>
                  )}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                >
                  <FaTimes />
                </motion.button>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-6 space-y-4 sm:space-y-5"
            >
              {/* Mode switch controls */}
              {!isEditMode && (
                <div className="mb-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-700 flex items-center">
                      <FaClipboardCheck className="mr-2 text-blue-500" />
                      Schedule Type
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsWeekWiseMode(!isWeekWiseMode)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 hover:bg-blue-100 px-2 sm:px-3 py-1.5 rounded-md transition-all"
                    >
                      {isWeekWiseMode ? (
                        <>
                          <FaCalendarDay className="mr-1 sm:mr-2" />{" "}
                          {isMobile ? "Single" : "Switch to Single Schedule"}
                        </>
                      ) : (
                        <>
                          <FaCalendarWeek className="mr-1 sm:mr-2" />{" "}
                          {isMobile ? "Week-wise" : "Switch to Week-wise Mode"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class*
                  </label>
                  <div className="relative">
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pl-3 pr-10"
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <FaSchool className="opacity-60" size={14} />
                    </div>
                  </div>
                </div>

                {/* Batch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch
                  </label>
                  <div className="relative">
                    <select
                      name="batch"
                      value={formData.batch}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pl-3 pr-10"
                    >
                      <option value="">Select Batch</option>
                      {batches.map((batch) => (
                        <option key={batch} value={batch}>
                          {batch}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <FaIdBadge className="opacity-60" size={14} />
                    </div>
                  </div>
                </div>

                {/* Day or Date Selection based on mode */}
                {isWeekWiseMode ? (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Days*
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-200 rounded-md bg-gray-50">
                      {days.map((day) => (
                        <div
                          key={day}
                          className="flex items-center space-x-2 sm:space-x-3"
                        >
                          <input
                            type="checkbox"
                            id={`day-${day}`}
                            checked={selectedDays[day]}
                            onChange={() => handleDayCheckboxChange(day)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`day-${day}`}
                            className="text-gray-700 flex items-center text-sm"
                          >
                            <FaCalendarDay
                              className="mr-1.5 text-blue-500"
                              size={12}
                            />
                            {day}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day
                      </label>
                      <div className="relative">
                        <select
                          name="day"
                          value={formData.day}
                          onChange={handleInputChange}
                          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pl-3 pr-10"
                          disabled={formData.date}
                        >
                          <option value="">Select Day</option>
                          {days.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <FaCalendarDay className="opacity-60" size={14} />
                        </div>
                      </div>
                      {formData.date && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <FaInfoCircle className="mr-1" size={12} />
                          Day is auto-determined by date
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specific Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-3 pr-10"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <FaRegCalendarAlt className="opacity-60" size={14} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <FaInfoCircle className="mr-1" size={12} />
                        {!formData.day && !formData.date
                          ? "Either day or date is required"
                          : "Leave empty to create a recurring schedule"}
                      </p>
                    </div>
                  </>
                )}

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject*
                  </label>
                  <div className="relative">
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pl-3 pr-10"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <FaBook className="opacity-60" size={14} />
                    </div>
                  </div>
                </div>

                {/* Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher Name*
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="teacherName"
                      value={formData.teacherName}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-3 pr-10"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <FaChalkboardTeacher className="opacity-60" size={14} />
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time*
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-3 pr-10"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <FaClock className="opacity-60" size={14} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time*
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-3 pr-10"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <FaClock className="opacity-60" size={14} />
                    </div>
                  </div>
                </div>

                {/* Room Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-3 pr-10"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <FaSchool className="opacity-60" size={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Any additional information..."
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <motion.button
                  whileHover={buttonHoverEffect}
                  whileTap={buttonTapEffect}
                  type="button"
                  onClick={closeModal}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                >
                  <FaTimes className="mr-1 sm:mr-2" /> Cancel
                </motion.button>
                <motion.button
                  whileHover={buttonHoverEffect}
                  whileTap={buttonTapEffect}
                  type="submit"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md hover:from-blue-700 hover:to-blue-600 flex items-center transition-colors shadow-sm"
                >
                  <FaSave className="mr-1 sm:mr-2" />
                  {isEditMode ? "Update Schedule" : "Save Schedule"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Update the main render function to use mobile or desktop views based on screen size
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {isMobile ? renderMobileHeader() : renderHeader()}
        {renderNotifications()}
        {isMobile ? renderMobileFilterPanel() : renderFilterPanel()}

        {/* Schedule Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12 bg-white rounded-xl shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-blue-600 font-medium">
              Loading schedules...
            </span>
          </div>
        ) : schedules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center shadow-sm"
          >
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="text-blue-400 text-xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No Schedules Found
            </h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto text-sm">
              {selectedClass || selectedDay || selectedBatch || selectedDate
                ? "No schedules match your current filters."
                : "Start by adding a new schedule."}
            </p>
            <motion.button
              whileHover={buttonHoverEffect}
              whileTap={buttonTapEffect}
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center shadow-sm text-sm"
            >
              <FaPlus className="mr-2" /> Create First Schedule
            </motion.button>
          </motion.div>
        ) : isMobile ? (
          viewMode === "table" ? (
            renderMobileScheduleTable()
          ) : (
            renderMobileScheduleList()
          )
        ) : viewMode === "table" ? (
          renderEnhancedScheduleTable()
        ) : (
          renderEnhancedScheduleList()
        )}

        {renderScheduleForm()}
      </div>
    </div>
  );
};

export default ScheduleManager;
