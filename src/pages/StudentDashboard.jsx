// 👇 Full code with updates
import React, { useEffect, useState } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaSignOutAlt,
  FaChartLine,
  FaUserShield,
  FaBars,
} from "react-icons/fa";
import {
  useNavigate,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router";
import DashboardResult from "../components/Page-Specific-Components/DashboardResult";
import DashboardAttendance from "../components/Page-Specific-Components/DashboardAttendance";
import DashboardHome from "./DashboardHome";
import TeacherLeaveCalendar from "../components/TeacherLeaveCalendar";
import AdminUserManagement from "../components/AdminUserManagement";
import CreateUserPage from "../components/CreateUserPage";

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
      window.location.reload();
    }
  }, [userRole]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleNav = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-64 bg-white shadow-lg flex-col justify-between px-4 py-6">
        <SidebarContent
          location={location}
          userRole={userRole}
          handleNav={handleNav}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Sidebar drawer for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-64 bg-white shadow-lg p-4 flex flex-col justify-between">
            <SidebarContent
              location={location}
              userRole={userRole}
              handleNav={handleNav}
              handleLogout={handleLogout}
            />
          </div>
          <div
            className="flex-1 bg-black bg-opacity-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100 w-full">
        {/* Mobile Menu Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center px-4 py-2 text-sm bg-green-700 text-white rounded shadow hover:bg-green-800"
          >
            <FaBars className="mr-2" /> Menu
          </button>
        </div>

        <Routes>
          <Route
            index
            element={
              <ProtectedStudent roles={["student", "teacher", "admin"]}>
                <DashboardHome name={studentName} studentClass={studentClass} />
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
        </Routes>
      </main>
    </div>
  );
};

const SidebarContent = ({ location, userRole, handleNav, handleLogout }) => (
  <div className="flex flex-col justify-between h-full">
    <div>
      {/* Logo + Name */}
      <div className="flex flex-col items-center mb-6">
        <img
          src="/ABHIGYAN_GURUKUL_logo.svg"
          alt="Logo"
          className="w-24 h-24 object-contain mb-2"
        />
        <h1 className="text-lg font-bold text-green-800 text-center">
          Abhigyan Gurukul
        </h1>

        {/* 🎯 ROLE BADGE */}
        <span className="mt-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
          ROLE: {userRole?.toUpperCase() || "UNKNOWN"}
        </span>

        <hr className="border-green-600 w-full mt-3" />
      </div>

      {/* Navigation Items */}
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
        icon={<FaCalendarAlt />}
        label="Attendance"
        active={location.pathname === "/student-dashboard/attendance"}
        onClick={() => handleNav("/student-dashboard/attendance")}
      />

      {userRole === "teacher" && (
        <SidebarItem
          icon={<FaUsers />}
          label="Manage Students"
          active={location.pathname === "/student-dashboard/admin/manage-users"}
          onClick={() => handleNav("/student-dashboard/admin/manage-users")}
        />
      )}

      {userRole === "admin" && (
        <SidebarItem
          icon={<FaUsers />}
          label="Manage Users"
          active={location.pathname === "/student-dashboard/admin/manage-users"}
          onClick={() => handleNav("/student-dashboard/admin/manage-users")}
        />
      )}

      {["teacher", "admin"].includes(userRole) && (
        <SidebarItem
          icon={<FaCalendarAlt />}
          label={
            <span className="flex items-center">
              Leaves
              <span className="ml-2 text-red-500 text-xs animate-pulse">
                🔴
              </span>
            </span>
          }
          active={location.pathname === "/student-dashboard/leaves"}
          onClick={() => handleNav("/student-dashboard/leaves")}
        />
      )}
    </div>

    {/* Log Out */}
    <div
      className="text-red-600 text-sm flex items-center cursor-pointer hover:underline mt-4"
      onClick={handleLogout}
    >
      <FaSignOutAlt className="mr-2" /> Log Out
    </div>
  </div>
);

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div
    className={`flex items-center px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-all duration-200 ${
      active ? "bg-green-800 text-white" : "text-gray-600 hover:bg-gray-200"
    }`}
    onClick={onClick}
  >
    <span className="mr-3 text-lg">{icon}</span>
    {label}
  </div>
);

export default StudentDashboard;
