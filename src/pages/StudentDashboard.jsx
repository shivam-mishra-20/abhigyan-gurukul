/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaSignOutAlt,
  FaChartLine,
  FaUserShield,
  FaBars,
  FaBook,
  FaExclamationCircle,
  FaComments, // Use FaComments for feedbacks icon
} from "react-icons/fa";
import {
  useNavigate,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import DashboardResult from "../components/Page-Specific-Components/DashboardResult";
import DashboardAttendance from "../components/Page-Specific-Components/DashboardAttendance";
import DashboardHome from "./DashboardHome";
import TeacherLeaveCalendar from "../components/TeacherLeaveCalendar";
import AdminUserManagement from "../components/AdminUserManagement";
import CreateUserPage from "../components/CreateUserPage";
import Leaderboards from "./Leaderboards";
import AdminEvents from "../components/AdminEvents";
import { notifyAuthStateChange } from "../components/Navbar";
import DevConsole from "../components/DevConsole";
import SyllabusManager from "../components/SyllabusManager";
import SyllabusProgress from "../components/SyllabusProgress";
import Complaints from "./Complaints";
import FeedbackButton from "../components/FeedbackButton";
import AdminFeedbackDisplay from "../components/AdminFeedbackDisplay";

const ProtectedStudent = ({ children, roles }) => {
  const userRole = localStorage.getItem("userRole");
  if (!userRole || (roles && !roles.includes(userRole))) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const studentName = localStorage.getItem("studentName") || "Student";
  const studentClass = localStorage.getItem("studentClass") || "N/A";
  const userRole = localStorage.getItem("userRole")?.trim();

  useEffect(() => {
    if (!userRole) {
      localStorage.setItem("userRole", "student");
      localStorage.setItem("studentName", "Dev Student");
      localStorage.setItem("studentClass", "10A");
      localStorage.setItem("isAuthenticated", "true");
      window.location.reload();
    }
  }, [userRole]);

  const handleLogout = () => {
    localStorage.clear();
    localStorage.removeItem("isAuthenticated");
    notifyAuthStateChange();
    navigate("/login");
  };

  const handleNav = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="hidden md:flex w-64 bg-white shadow-lg flex-col justify-between px-4 py-6 border-r border-gray-200"
      >
        <SidebarContent
          location={location}
          userRole={userRole}
          handleNav={handleNav}
          handleLogout={handleLogout}
        />
      </motion.aside>

      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="w-64 bg-white shadow-lg p-4 flex flex-col justify-between z-50"
            >
              <SidebarContent
                location={location}
                userRole={userRole}
                handleNav={handleNav}
                handleLogout={handleLogout}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 backdrop-blur-xs"
              onClick={() => setIsSidebarOpen(false)}
            />
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 w-full min-h-full">
        <div className="md:hidden mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center px-4 py-2 text-sm bg-green-700 text-white rounded-lg shadow hover:bg-green-800 transition-all duration-200"
          >
            <FaBars className="mr-2" /> Menu
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Routes>
              <Route
                index
                element={
                  <ProtectedStudent roles={["student", "teacher", "admin"]}>
                    <DashboardHome
                      name={studentName}
                      studentClass={studentClass}
                    />
                  </ProtectedStudent>
                }
              />
              <Route
                path="results"
                element={
                  <ProtectedStudent roles={["student", "teacher", "admin"]}>
                    <DashboardResult />
                  </ProtectedStudent>
                }
              />
              <Route
                path="leaderboards"
                element={
                  <ProtectedStudent roles={["student", "teacher", "admin"]}>
                    <Leaderboards />
                  </ProtectedStudent>
                }
              />
              <Route
                path="dev-console"
                element={
                  <ProtectedStudent roles={["admin"]}>
                    <DevConsole />
                  </ProtectedStudent>
                }
              />
              <Route
                path="attendance"
                element={
                  <ProtectedStudent roles={["student", "admin", "teacher"]}>
                    <DashboardAttendance />
                  </ProtectedStudent>
                }
              />
              <Route
                path="leaves"
                element={
                  <ProtectedStudent roles={["teacher", "admin"]}>
                    <TeacherLeaveCalendar />
                  </ProtectedStudent>
                }
              />
              <Route
                path="admin/manage-users"
                element={
                  <ProtectedStudent roles={["admin", "teacher"]}>
                    <AdminUserManagement />
                  </ProtectedStudent>
                }
              />
              <Route
                path="admin/create-user"
                element={
                  <ProtectedStudent roles={["admin"]}>
                    <CreateUserPage />
                  </ProtectedStudent>
                }
              />

              {/* <Route
                path="admin/admin-chat"
                element={
                  <ProtectedStudent roles={["admin", "teacher"]}>
                    <AdminChatPage />
                  </ProtectedStudent>
                }
              /> */}
              <Route
                path="/adminevents"
                element={
                  <ProtectedStudent roles={["admin", "teacher"]}>
                    <AdminEvents />
                  </ProtectedStudent>
                }
              />
              <Route
                path="/syllabus"
                element={
                  <ProtectedStudent roles={["admin", "teacher"]}>
                    <SyllabusManager />
                  </ProtectedStudent>
                }
              />
              <Route
                path="/syllabus-progress"
                element={
                  <ProtectedStudent roles={["student", "admin", "teacher"]}>
                    <SyllabusProgress />
                  </ProtectedStudent>
                }
              />
              <Route
                path="/complaints"
                element={
                  <ProtectedStudent roles={["admin", "teacher", "student"]}>
                    <Complaints />
                  </ProtectedStudent>
                }
              />
              <Route
                path="feedbacks"
                element={
                  <ProtectedStudent roles={["admin", "teacher"]}>
                    <AdminFeedbackDisplay />
                  </ProtectedStudent>
                }
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Add the feedback button if the user is a student or teacher */}
      {userRole === "student" && <FeedbackButton />}
    </div>
  );
};

const SidebarContent = ({ location, userRole, handleNav, handleLogout }) => (
  <div className="flex flex-col justify-between h-full">
    <div>
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="flex flex-col items-center mb-6"
      >
        <motion.img
          whileHover={{ scale: 1.05 }}
          src="/ABHIGYAN_GURUKUL_logo.svg"
          alt="Logo"
          className="w-24 h-24 object-contain mb-2 drop-shadow-md"
        />
        <h1 className="text-lg font-bold text-green-800 text-center">
          Abhigyan Gurukul
        </h1>
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="mt-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-green-200"
        >
          ROLE: {userRole?.toUpperCase() || "UNKNOWN"}
        </motion.span>
        <hr className="border-green-600 w-full mt-3 opacity-50" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, staggerChildren: 0.1 }}
        className="space-y-1"
      >
        <SidebarItem
          icon={<FaTachometerAlt />}
          label="Dashboard"
          active={location.pathname === "/student-dashboard"}
          onClick={() => handleNav("/student-dashboard")}
        />
        <SidebarItem
          icon={<FaChartLine />}
          label="Results"
          active={location.pathname === "/student-dashboard/results"}
          onClick={() => handleNav("/student-dashboard/results")}
        />
        <SidebarItem
          icon={<FaUserShield />}
          label="Leaderboards"
          active={location.pathname === "/student-dashboard/leaderboards"}
          onClick={() => handleNav("/student-dashboard/leaderboards")}
        />
        <SidebarItem
          icon={<FaCalendarAlt />}
          label="Attendance"
          active={location.pathname === "/student-dashboard/attendance"}
          onClick={() => handleNav("/student-dashboard/attendance")}
        />
        {userRole === "teacher" && (
          <SidebarItem
            icon={<FaUsers />}
            label="Manage Students"
            active={
              location.pathname === "/student-dashboard/admin/manage-users"
            }
            onClick={() => handleNav("/student-dashboard/admin/manage-users")}
          />
        )}
        {userRole === "admin" && (
          <>
            <SidebarItem
              icon={<FaUsers />}
              label="Manage Users"
              active={
                location.pathname === "/student-dashboard/admin/manage-users"
              }
              onClick={() => handleNav("/student-dashboard/admin/manage-users")}
            />
            {/* <SidebarItem
              icon={<FaUserShield />}
              label="Developer Console"
              active={location.pathname === "/student-dashboard/dev-console"}
              onClick={() => handleNav("/student-dashboard/dev-console")}
            /> */}
          </>
        )}
        {["teacher", "admin"].includes(userRole) && (
          <SidebarItem
            icon={<FaCalendarAlt />}
            label={
              <span className="flex items-center">
                Leaves
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="ml-2 text-red-500 text-xs"
                >
                  🔴
                </motion.span>
              </span>
            }
            active={location.pathname === "/student-dashboard/leaves"}
            onClick={() => handleNav("/student-dashboard/leaves")}
          />
        )}
        {["teacher", "admin"].includes(userRole) && (
          <>
            <SidebarItem
              icon={<FaBook />}
              label="Syllabus Management"
              active={location.pathname === "/student-dashboard/syllabus"}
              onClick={() => handleNav("/student-dashboard/syllabus")}
            />
            <SidebarItem
              icon={<FaComments />} // Use comments icon for Feedbacks
              label="Feedbacks"
              active={location.pathname === "/student-dashboard/feedbacks"}
              onClick={() => handleNav("/student-dashboard/feedbacks")}
            />
            {/* <SidebarItem
              icon={<FaBook />}
              label="Chat System WIP"
              active={
                location.pathname === "/student-dashboard/admin/admin-chat"
              }
              onClick={() => handleNav("/student-dashboard/admin/admin-chat")}
            /> */}
          </>
        )}
        {userRole === "student" && (
          <SidebarItem
            icon={<FaBook />}
            label="View Syllabus"
            active={
              location.pathname === "/student-dashboard/syllabus-progress"
            }
            onClick={() => handleNav("/student-dashboard/syllabus-progress")}
          />
        )}
        {["teacher", "admin", "student"].includes(userRole) && (
          <SidebarItem
            icon={<FaExclamationCircle />}
            label="Complaints"
            active={location.pathname === "/student-dashboard/complaints"}
            onClick={() => handleNav("/student-dashboard/complaints")}
          />
        )}
      </motion.div>
    </div>
    <motion.div
      whileHover={{ x: 5 }}
      className="text-red-600 text-sm flex items-center cursor-pointer hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
      onClick={handleLogout}
    >
      <FaSignOutAlt className="mr-2" /> Log Out
    </motion.div>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }) => (
  <motion.div
    whileHover={{ x: active ? 0 : 5 }}
    whileTap={{ scale: 0.95 }}
    className={`flex items-center px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-green-700 to-green-800 text-white shadow-md"
        : "text-gray-600 hover:bg-gray-100"
    }`}
    onClick={onClick}
  >
    <span
      className={`mr-3 text-lg ${active ? "text-white" : "text-green-600"}`}
    >
      {icon}
    </span>
    {label}
  </motion.div>
);

export default StudentDashboard;
