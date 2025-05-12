import { useState, useEffect } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuthStatus = () => {
      const userRole = localStorage.getItem("userRole");
      const studentName = localStorage.getItem("studentName");

      // User is authenticated if they have role and name in localStorage
      setIsAuthenticated(!!(userRole && studentName));
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = (userData) => {
    // Store user data in localStorage
    localStorage.setItem("studentName", userData.name);
    localStorage.setItem("userRole", userData.role || "student");

    if (userData.email) {
      localStorage.setItem("studentEmail", userData.email);
    }

    if (userData.uid) {
      localStorage.setItem("uid", userData.uid);
    }

    if (userData.Class) {
      localStorage.setItem("studentClass", userData.Class);
    }

    // Set authentication flag
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Clear all authentication data
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, login, logout };
};
