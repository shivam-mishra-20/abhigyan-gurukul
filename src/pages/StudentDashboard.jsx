/* eslint-disable no-unused-vars */
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
  FaBookOpen,
  FaExclamationCircle,
  FaComments,
  FaSearch,
  FaBell,
  FaCog,
  FaChartArea, // Added for traffic dashboard icon
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
import Goals from "./Goals";
import SyllabusReport from "./SyllabusReport"; // Import SyllabusReport component
import TimeTable from "./TimeTable"; // Import TimeTable component
import TimeTableManager from "./TimeTableManager"; // Import TimeTableManager component
import TrafficDashboard from "../components/TrafficDashboard"; // Import TrafficDashboard component

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null); // State to store profile picture URL

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
    } else {
      // Fetch the user's profile picture from the server or local storage
      const fetchProfilePic = async () => {
        // Fetch from Firestore Users collection using the same logic as UserProfile
        const userRole = localStorage.getItem("userRole")?.trim();
        const userName = localStorage.getItem("studentName");
        if (userRole && userName) {
          try {
            const { db } = await import("../firebaseConfig");
            const { collection, query, where, getDocs } = await import(
              "firebase/firestore"
            );
            const { getStorage, ref, getDownloadURL } = await import(
              "firebase/storage"
            );
            const q = query(
              collection(db, "Users"),
              where("name", "==", userName)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const userData = snapshot.docs[0].data();
              // Try to fetch from storage using naming convention
              const dateStr = new Date().toISOString().split("T")[0];
              const ext = userData.profilePicUrl
                ? userData.profilePicUrl.split(".").pop().split("?")[0]
                : "png";
              const fileName = `${userData.name}_${userRole}_${dateStr}.${ext}`;
              try {
                const storage = getStorage();
                const storageRef = ref(storage, `profilePics/${fileName}`);
                const url = await getDownloadURL(storageRef);
                setProfilePic(url);
              } catch (e) {
                if (userData.profilePicUrl)
                  setProfilePic(userData.profilePicUrl);
              }
            }
          } catch (error) {
            setProfilePic(null);
          }
        }
      };

      fetchProfilePic();
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
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white shadow-md px-6 py-3 flex justify-between items-center z-10 relative">
        <div className="flex items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            <FaBars />
          </motion.button>
          <img
            src="/ABHIGYAN_GURUKUL_logo.svg"
            alt="Logo"
            className="h-10 md:h-12 ml-3 md:ml-0"
          />
          <h1 className="hidden md:block text-xl font-bold text-green-700 ml-3">
            Abhigyan Gurukul
          </h1>
        </div>

        {/* <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 flex-grow max-w-xl mx-6">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="bg-transparent border-none outline-none w-full text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div> */}

        <div className="flex items-center space-x-4">
          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <FaBell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </motion.button> */}

          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center cursor-pointer bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-all duration-200 border border-gray-200 shadow-sm"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white font-semibold text-sm shadow overflow-hidden border-2 border-green-500">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover border-2 border-white shadow"
                  />
                ) : (
                  <span className="text-lg font-bold">
                    {studentName?.charAt(0).toUpperCase() || "S"}
                  </span>
                )}
              </div>
              <span className="hidden md:block ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {studentName}
              </span>
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2 text-gray-500 hidden md:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </motion.div>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 350 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 overflow-hidden"
                >
                  <div className="relative pt-12 pb-4 px-5 border-b border-gray-100 bg-gradient-to-br from-green-50 to-green-100">
                    <div className="absolute top-4 left-4 h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white text-3xl font-bold shadow-md border-4 border-white">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt="Profile"
                          className="h-16 w-16 rounded-full object-cover border-4 border-white shadow"
                        />
                      ) : (
                        <span>
                          {studentName?.charAt(0).toUpperCase() || "S"}
                        </span>
                      )}
                    </div>
                    <div className="ml-16 pl-2">
                      <p className="text-base font-medium text-gray-800">
                        {studentName}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="px-2 py-0.5 rounded-md bg-green-200 text-green-800 text-xs font-semibold">
                          {userRole?.toUpperCase()}
                        </div>
                        {userRole === "student" && (
                          <div className="ml-2 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                            {studentClass}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="py-1 px-1">
                    <motion.a
                      whileHover={{ backgroundColor: "#f3f4f6", x: 4 }}
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 rounded-md"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate("/student-dashboard/userprofile");
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      My Profile
                    </motion.a>

                    {/* <motion.a
                      whileHover={{ backgroundColor: "#f3f4f6", x: 4 }}
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 rounded-md"
                      onClick={() => {
                        // Future feature: Open settings page
                        setIsProfileMenuOpen(false);
                      }}
                    >
                      <FaCog className="h-5 w-5 mr-3 text-gray-500" />
                      Settings
                    </motion.a> */}

                    <div className="border-t border-gray-100 my-1"></div>

                    <motion.a
                      whileHover={{
                        backgroundColor: "#FEE2E2",
                        color: "#DC2626",
                        x: 4,
                      }}
                      transition={{ duration: 0.2 }}
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-red-600 rounded-md mt-1"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="h-5 w-5 mr-3" />
                      Logout from system
                    </motion.a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="hidden md:flex w-64 bg-white shadow-lg flex-col justify-between border-r border-gray-200"
        >
          <SidebarContent
            location={location}
            userRole={userRole}
            handleNav={handleNav}
            handleLogout={handleLogout}
          />
        </motion.aside>

        {/* Sidebar - Mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <div className="fixed inset-0 z-40 flex md:hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="w-64 bg-white shadow-lg flex flex-col z-50 h-full"
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
                className="flex-1 bg-gray-900/50 backdrop-blur-sm"
                onClick={() => setIsSidebarOpen(false)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 w-full">
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
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
                  <Route
                    path="goals"
                    element={
                      <ProtectedStudent roles={["teacher", "admin"]}>
                        <Goals />
                      </ProtectedStudent>
                    }
                  />
                  {/* <Route
                path="test"
                element={
                  <ProtectedStudent roles={["student", "teacher", "admin"]}>
                    <Test />
                  </ProtectedStudent>
                }
              /> */}
                  {/* <Route
                path="schedules"
                element={
                  <ProtectedStudent roles={["student", "teacher", "admin"]}>
                    <ScheduleDisplay />
                  </ProtectedStudent>
                }
              /> */}
                  <Route
                    path="syllabus-report"
                    element={
                      <ProtectedStudent roles={["student", "teacher", "admin"]}>
                        <SyllabusReport />
                      </ProtectedStudent>
                    }
                  />
                  <Route
                    path="time-table"
                    element={
                      <ProtectedStudent roles={["student", "teacher", "admin"]}>
                        <TimeTable />
                      </ProtectedStudent>
                    }
                  />
                  <Route
                    path="time-table-manager"
                    element={
                      <ProtectedStudent roles={["teacher", "admin"]}>
                        <TimeTableManager />
                      </ProtectedStudent>
                    }
                  />
                  {/* Add new route for Traffic Dashboard */}
                  <Route
                    path="trafficdashboard"
                    element={
                      <ProtectedStudent roles={["admin"]}>
                        <TrafficDashboard />
                      </ProtectedStudent>
                    }
                  />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Add the feedback button if the user is a student or teacher */}
      {userRole === "student" && <FeedbackButton />}
    </div>
  );
};

const SidebarContent = ({ location, userRole, handleNav, handleLogout }) => (
  <div className="flex flex-col h-full">
    <div className="flex-1 min-h-0 overflow-y-auto py-4">
      <div className="flex flex-col items-center mb-6 px-4">
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-green-200 w-full text-center"
        >
          {userRole?.toUpperCase() || "UNKNOWN"}
        </motion.span>
      </div>

      <div className="space-y-1 px-3">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Main
        </p>
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

        {(userRole === "teacher" || userRole === "admin") && (
          <>
            <div className="my-4 border-t border-gray-200"></div>
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Administration
            </p>
          </>
        )}

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
            {/* Add Traffic Dashboard item for admin only */}
            <SidebarItem
              icon={<FaChartArea />}
              label="Traffic Analytics"
              active={
                location.pathname === "/student-dashboard/trafficdashboard"
              }
              onClick={() => handleNav("/student-dashboard/trafficdashboard")}
            />
          </>
        )}

        {["teacher", "admin"].includes(userRole) && (
          <SidebarItem
            icon={<FaCalendarAlt />}
            label={
              <div className="flex items-center justify-between w-full">
                <span>Leaves</span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-500 text-xs"
                >
                  3
                </motion.span>
              </div>
            }
            active={location.pathname === "/student-dashboard/leaves"}
            onClick={() => handleNav("/student-dashboard/leaves")}
          />
        )}

        {(userRole === "teacher" || userRole === "admin") && (
          <>
            <div className="my-4 border-t border-gray-200"></div>
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Academic
            </p>
          </>
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
              icon={<FaComments />}
              label="Feedbacks"
              active={location.pathname === "/student-dashboard/feedbacks"}
              onClick={() => handleNav("/student-dashboard/feedbacks")}
            />
            <SidebarItem
              icon={<FaChartLine />}
              label="Goals"
              active={location.pathname === "/student-dashboard/goals"}
              onClick={() => handleNav("/student-dashboard/goals")}
            />
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

        <div className="my-4 border-t border-gray-200"></div>
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Reports
        </p>

        {["teacher", "admin", "student"].includes(userRole) && (
          <SidebarItem
            icon={<FaExclamationCircle />}
            label="Complaints"
            active={location.pathname === "/student-dashboard/complaints"}
            onClick={() => handleNav("/student-dashboard/complaints")}
          />
        )}

        <SidebarItem
          icon={<FaBell />}
          label="Class Report"
          active={location.pathname === "/student-dashboard/syllabus-report"}
          onClick={() => handleNav("/student-dashboard/syllabus-report")}
        />
        <SidebarItem
          icon={<FaBookOpen />}
          label="Time Table"
          active={location.pathname === "/student-dashboard/time-table"}
          onClick={() => handleNav("/student-dashboard/time-table")}
        />
        {["teacher", "admin"].includes(userRole) && (
          <SidebarItem
            icon={<FaBookOpen />}
            label="Time Table Manager"
            active={
              location.pathname === "/student-dashboard/time-table-manager"
            }
            onClick={() => handleNav("/student-dashboard/time-table-manager")}
          />
        )}
      </div>
    </div>

    <div className="p-4 mt-auto">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow hover:shadow-md"
      >
        <FaSignOutAlt className="mr-2" /> Log Out
      </motion.button>
    </div>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md"
        : "text-gray-700 hover:bg-gray-100"
    }`}
    onClick={onClick}
  >
    <span
      className={`mr-3 text-lg ${active ? "text-white" : "text-green-600"}`}
    >
      {icon}
    </span>
    <span className="flex-grow">{label}</span>

    {active && (
      <motion.div
        layoutId="activeIndicator"
        className="h-2 w-2 rounded-full bg-white"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </motion.div>
);

export default StudentDashboard;
