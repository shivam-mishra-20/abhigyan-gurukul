/* eslint-disable no-unused-vars */

/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { motion } from "framer-motion";
import { FaUserShield, FaExclamationTriangle } from "react-icons/fa";
import ProtectedStudentRoute from "./ProtectedStudentRoute";

// This component now leverages ProtectedStudentRoute with admin-only roles
const AdminOnlyRoute = ({ children }) => {
  return (
    <ProtectedStudentRoute roles={["admin"]}>{children}</ProtectedStudentRoute>
  );
};

export default AdminOnlyRoute;
