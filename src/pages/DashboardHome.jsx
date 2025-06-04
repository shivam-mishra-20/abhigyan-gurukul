/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import StudentPerformanceChart from "../components/Page-Specific-Components/StudentPerformanceChart";
import StudentComplaintsWidget from "../components/StudentComplaintsWidget";
import AdminFeedbackDisplay from "../components/AdminFeedbackDisplay";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaClipboardList,
  FaUserEdit,
  FaBell,
  FaChartLine,
  FaCalendarAlt,
  FaBook,
  FaExclamationCircle,
} from "react-icons/fa";

const DashboardHome = ({ name }) => {
  const role = localStorage.getItem("userRole");
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const previousScore = 65;
  const currentScore = 78;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300 },
    },
  };

  const adminCards = [
    {
      icon: <FaUsers className="text-3xl" />,
      title: "Manage Users",
      description: "Add, edit, delete users",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800",
      route: "/student-dashboard/admin/manage-users",
      highlight: true,
    },
    {
      icon: <FaChalkboardTeacher className="text-3xl" />,
      title: "Teacher Leaves",
      description: "Review leave records",
      bg: "bg-gradient-to-br from-green-50 to-green-100 text-green-800",
      route: "/student-dashboard/leaves",
      highlight: false,
    },
    {
      icon: <FaClipboardList className="text-3xl" />,
      title: "Manage Results",
      description: "View and manage student results",
      bg: "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800",
      route: "/student-dashboard/results",
      highlight: false,
    },
    {
      icon: <FaChartLine className="text-3xl" />,
      title: "Manage Attendance",
      description: "Review attendance records",
      bg: "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-800",
      route: "/student-dashboard/attendance",
      highlight: false,
    },
    {
      icon: <FaCalendarAlt className="text-3xl" />,
      title: "Manage Events",
      description: "Create and edit events",
      bg: "bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-800",
      route: "/student-dashboard/adminevents",
      highlight: true,
    },
    {
      icon: <FaBook className="text-3xl" />,
      title: "Syllabus Management",
      description: "Update syllabus progress",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800",
      route: "/student-dashboard/syllabus",
      highlight: true,
    },
    {
      icon: <FaExclamationCircle className="text-3xl" />,
      title: "Manage Complaints",
      description: "Record student complaints",
      bg: "bg-gradient-to-br from-red-50 to-red-100 text-red-800",
      route: "/student-dashboard/complaints",
      highlight: false,
    },
  ];

  const teacherCards = [
    {
      icon: <FaChalkboardTeacher className="text-3xl" />,
      title: "My Leave Calendar",
      description: "Manage your leaves",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800",
      route: "/student-dashboard/leaves",
      highlight: true,
    },
    {
      icon: <FaClipboardList className="text-3xl" />,
      title: "Student Results",
      description: "View and update results",
      bg: "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800",
      route: "/student-dashboard/results",
      highlight: true,
    },
    {
      icon: <FaBook className="text-3xl" />,
      title: "Update Syllabus",
      description: "Track teaching progress",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800",
      route: "/student-dashboard/syllabus",
      highlight: true,
    },
    {
      icon: <FaExclamationCircle className="text-3xl" />,
      title: "Student Complaints",
      description: "Record behavioral issues",
      bg: "bg-gradient-to-br from-red-50 to-red-100 text-red-800",
      route: "/student-dashboard/complaints",
      highlight: false,
    },
  ];

  const studentCards = [
    {
      icon: <FaChartLine className="text-3xl" />,
      title: "My Results",
      description: "View your academic results",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800",
      route: "/student-dashboard/results",
      highlight: true,
    },
    {
      icon: <FaCalendarAlt className="text-3xl" />,
      title: "My Attendance",
      description: "Check your attendance records",
      bg: "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800",
      route: "/student-dashboard/attendance",
      highlight: true,
    },
    {
      icon: <FaBook className="text-3xl" />,
      title: "Syllabus Progress",
      description: "Track class syllabus status",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800",
      route: "/student-dashboard/syllabus-progress",
      highlight: true,
    },
    {
      icon: <FaExclamationCircle className="text-3xl" />,
      title: "My Complaints",
      description: "View complaints filed by teachers",
      bg: "bg-gradient-to-br from-red-50 to-red-100 text-red-800",
      route: "/student-dashboard/complaints",
      highlight: false,
    },
  ];

  const currentDate = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = currentDate.toLocaleDateString("en-US", options);

  let dashboardCards;
  if (role === "admin") {
    dashboardCards = adminCards;
  } else if (role === "teacher") {
    dashboardCards = teacherCards;
  } else {
    dashboardCards = studentCards;
  }

  return (
    <motion.div
      className="space-y-8 px-4 md:px-10 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-xl shadow-sm border border-gray-100"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Welcome, <span className="text-green-700">{name}!</span>
            </h1>
            <p className="text-gray-500 mt-1">{formattedDate}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {dashboardCards.map((card, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)",
            }}
            className={`${card.bg} rounded-lg p-6 shadow-md cursor-pointer ${
              card.highlight ? "border-l-4 border-green-500" : ""
            }`}
            onClick={() => navigate(card.route)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xl mb-2">{card.title}</h3>
                <p className="text-sm opacity-80">{card.description}</p>
              </div>
              <div className="rounded-full p-3 bg-white bg-opacity-60">
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {role === "admin" && (
        <div className="mt-8">
          <AdminFeedbackDisplay />
        </div>
      )}

      {role === "student" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <StudentPerformanceChart />
          </div>
          <div>
            <StudentComplaintsWidget />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardHome;
