import React, { useEffect } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaSignOutAlt,
  FaChartLine,
  FaUserShield,
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

// ✅ Role-based protection wrapper
const ProtectedStudent = ({ children, roles }) => {
  const userRole = localStorage.getItem("userRole");

  console.log("Checking role:", userRole, "Allowed:", roles); // Debug line

  if (!userRole || (roles && !roles.includes(userRole))) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const studentName = localStorage.getItem("studentName") || "Student";
  const studentClass = localStorage.getItem("studentClass") || "N/A";
  const userRole = localStorage.getItem("userRole")?.trim(); // ✨ trim spaces

  // Optional: Ensure fallback roles during development (remove in prod)
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
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg px-4 py-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center mb-10">
            <img
              src="/ABHIGYAN_GURUKUL_logo.svg"
              alt="Abhigyan Gurukul Logo"
              className="w-30 h-30 object-contain mb-2"
            />
            <h1 className="text-xl font-bold text-green-800 text-center">
              Abhigyan Gurukul
            </h1>
            <hr className="w-50 border-green-600 mt-2" />
          </div>

          <nav className="space-y-2">
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
            {userRole === "admin" && (
              <SidebarItem
                icon={<FaUserShield />}
                label="Admin Tools"
                active={location.pathname === "/student-dashboard/admin"}
                onClick={() => handleNav("/student-dashboard/admin")}
              />
            )}
            {userRole === "teacher" && (
              <SidebarItem
                icon={<FaUsers />}
                label="Manage Students"
                active={
                  location.pathname === "/student-dashboard/manage-students"
                }
                onClick={() => handleNav("/student-dashboard/manage-students")}
              />
            )}
          </nav>
        </div>

        <div
          className="text-red-600 text-sm flex items-center cursor-pointer hover:underline"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="mr-2" /> Log Out
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
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
              <ProtectedStudent roles={["student"]}>
                <DashboardAttendance />
              </ProtectedStudent>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedStudent roles={["admin"]}>
                <div>🛠️ Admin Tools Area</div>
              </ProtectedStudent>
            }
          />
          <Route
            path="manage-students"
            element={
              <ProtectedStudent roles={["teacher"]}>
                <div>👥 Teacher's Student Management Panel</div>
              </ProtectedStudent>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

// Sidebar item helper
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
