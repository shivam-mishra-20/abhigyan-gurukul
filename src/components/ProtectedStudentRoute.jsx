/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router";
import { motion } from "framer-motion";
import { FaUserShield, FaExclamationTriangle, FaLock } from "react-icons/fa";

const ProtectedStudentRoute = ({ children, roles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const userRole = localStorage.getItem("userRole");
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const hasUserData = !!localStorage.getItem("studentName");

  useEffect(() => {
    // Simulate checking permissions with a slight delay for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Verifying permissions...
          </p>
        </div>
      </div>
    );
  }

  // Handle admin-only routes
  if (
    roles &&
    roles.includes("admin") &&
    roles.length === 1 &&
    userRole !== "admin"
  ) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FaExclamationTriangle className="mx-auto text-5xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This area is
            restricted to administrators only.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Handle authentication and role check for normal routes
  if (
    !isAuthenticated ||
    !hasUserData ||
    (roles && !roles.includes(userRole))
  ) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FaLock className="mx-auto text-5xl text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to log in to access this page.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return children;
};

export default ProtectedStudentRoute;
