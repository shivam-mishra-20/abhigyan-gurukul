import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import StudentPerformanceChart from "../components/Page-Specific-Components/StudentPerformanceChart";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaClipboardList,
  FaUserEdit,
  FaBell,
  FaChartLine,
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
  ];

  const currentDate = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = currentDate.toLocaleDateString("en-US", options);

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
          {/* <motion.div
            className="mt-3 md:mt-0 flex items-center bg-green-50 px-3 py-2 rounded-lg border border-green-100"
            whileHover={{ scale: 1.03 }}
          >
            //Notification icon and message can be added here
            <FaBell className="text-green-500 mr-2" />
            <span className="text-sm text-green-700 font-medium">
              {role === "student"
                ? "All assignments up to date"
                : "No pending approvals"}
            </span>
          </motion.div> */}
        </div>
      </motion.div>

      {/* STUDENT VIEW */}
      {role === "student" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/student-dashboard/results")}
              className="bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800 p-5 rounded-xl shadow-sm border border-purple-200 flex items-center gap-4 cursor-pointer transition-all"
            >
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <FaClipboardList className="text-2xl text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-bold">View Results</div>
                <div className="text-xs text-purple-600">
                  Check your academic performance
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/student-dashboard/attendance")}
              className="bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-800 p-5 rounded-xl shadow-sm border border-indigo-200 flex items-center gap-4 cursor-pointer transition-all"
            >
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <FaChartLine className="text-2xl text-indigo-600" />
              </div>
              <div>
                <div className="text-sm font-bold">Attendance</div>
                <div className="text-xs text-indigo-600">
                  Track your classroom attendance
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-white shadow-md border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">
                Performance Analytics
              </h2>
              <p className="text-xs text-indigo-100">
                Track your academic progress over time
              </p>
            </div>

            {/* 👉 Remove fixed height */}
            <div className="p-5 space-y-8">
              <StudentPerformanceChart
                previous={previousScore}
                current={currentScore}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* TEACHER VIEW */}
      {role === "teacher" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.h2
            variants={itemVariants}
            className="text-xl font-semibold text-gray-700"
          >
            Quick Access
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            <EnhancedCard
              icon={<FaClipboardList className="text-2xl" />}
              title="Results"
              description="Manage or view student results"
              bgClass="from-purple-50 to-purple-100 text-purple-800 border-purple-200"
              iconClass="text-purple-500 bg-purple-100"
              onClick={() => navigate("/student-dashboard/results")}
            />
            <EnhancedCard
              icon={<FaChalkboardTeacher className="text-2xl" />}
              title="Leaves"
              description="Apply leave or view teacher leaves"
              bgClass="from-green-50 to-green-100 text-green-800 border-green-200"
              iconClass="text-green-500 bg-green-100"
              onClick={() => navigate("/student-dashboard/leaves")}
              badge={3}
            />
            <EnhancedCard
              icon={<FaUserEdit className="text-2xl" />}
              title="Manage Users"
              description="Create, edit, delete users"
              bgClass="from-blue-50 to-blue-100 text-blue-800 border-blue-200"
              iconClass="text-blue-500 bg-blue-100"
              onClick={() => navigate("/student-dashboard/admin/manage-users")}
            />
          </motion.div>
        </motion.div>
      )}

      {/* ADMIN VIEW */}
      {role === "admin" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 shadow-md rounded-xl border border-gray-100 space-y-6"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold mb-1 text-gray-800">
              Admin Dashboard
            </h2>
            <div className="flex items-center text-gray-600">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                ADMIN
              </span>
              <p>You have full access to system management</p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {adminCards.map((card, index) => (
              <EnhancedCard
                key={index}
                icon={card.icon}
                title={card.title}
                description={card.description}
                bgClass={card.bg.replace("bg-", "from-").replace("to-", "")}
                iconClass={`text-${
                  card.bg.split(" ")[1].split("-")[0]
                }-500 bg-${card.bg.split(" ")[1].split("-")[0]}-100`}
                onClick={() => navigate(card.route)}
                highlight={card.highlight}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

const EnhancedCard = ({
  icon,
  title,
  description,
  onClick,
  bgClass,
  iconClass,
  highlight,
  badge,
}) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={`cursor-pointer transition-all duration-300 p-5 rounded-xl shadow-sm border bg-gradient-to-br ${bgClass} relative overflow-hidden group`}
  >
    <div className="flex items-start gap-4">
      <div
        className={`p-3 rounded-lg ${iconClass} flex items-center justify-center shadow-sm transition-all group-hover:scale-110`}
      >
        {icon}
      </div>
      <div>
        <div className="text-base font-semibold flex items-center gap-2">
          {title}
          {badge && (
            <motion.span
              className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, delay: 0.5 }}
            >
              {badge} new
            </motion.span>
          )}
        </div>
        <div className="text-sm mt-1 opacity-80">{description}</div>
      </div>
    </div>

    {highlight && (
      <div className="absolute top-0 right-0">
        <div className="bg-yellow-400 text-yellow-800 text-xs transform rotate-45 translate-y-2 translate-x-6 px-8 py-0.5 shadow-sm">
          New
        </div>
      </div>
    )}

    <motion.div
      className="absolute bottom-0 left-0 w-full h-1 bg-white opacity-0 group-hover:opacity-30"
      initial={{ scaleX: 0 }}
      whileHover={{ scaleX: 1 }}
      transition={{ duration: 0.3 }}
    />
  </motion.div>
);

export default DashboardHome;
