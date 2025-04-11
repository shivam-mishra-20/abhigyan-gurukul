import React, { useEffect, useState } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
  FaChartLine,
  FaUserShield,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { Routes, Route, useLocation, Navigate } from "react-router";

const ProtectedRoute = ({ children, roles }) => {
  const userRole = localStorage.getItem("userRole");
  if (!userRole || (roles && !roles.includes(userRole))) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const DashboardResult = () => {
  const studentName = localStorage.getItem("studentName") || "Student";
  const studentClass = localStorage.getItem("studentClass") || "N/A";
  const userRole = localStorage.getItem("userRole") || "student";

  const navigate = useNavigate();
  const location = useLocation();

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
      <div className="w-64 bg-white shadow-lg px-4 py-6 flex flex-col justify-between">
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
                label="Student Management"
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute roles={["student", "teacher", "admin"]}>
                <div>
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-green-800">
                      Welcome to Abhigyan Gurukul
                    </h2>
                    <div className="text-lg font-medium text-gray-700">
                      Hi {studentName}!
                      <br />
                      Class: {studentClass}
                    </div>
                  </div>
                  <div className="mt-8">
                    <p className="text-gray-600">
                      Select an option from the left panel to view your Results
                      or Attendance.
                    </p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div
    className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium ${
      active ? "bg-green-800 text-white" : "text-gray-600 hover:bg-gray-200"
    }`}
    onClick={onClick}
  >
    <span className="mr-3 text-lg">{icon}</span>
    {label}
  </div>
);

export default DashboardResult;
