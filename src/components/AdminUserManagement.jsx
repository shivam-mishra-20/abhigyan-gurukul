import React, { useEffect, useState } from "react";
import {
  getDocs,
  collection,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router";
import bcrypt from "bcryptjs";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const AdminUserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editUser, setEditUser] = useState(null); // null means modal hidden
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState({
    message: "",
    type: "",
  });

  const usersPerPage = 9;
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const snap = await getDocs(collection(db, "Users"));
        const users = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          batch: d.data().batch || "", // Ensure batch is always defined
        }));
        users.sort((a, b) => a.name.localeCompare(b.name));
        setAllUsers(users);
        setFilteredUsers(users);
      } catch (error) {
        showFeedback("Failed to load users", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Show temporary feedback message
  const showFeedback = (message, type = "success") => {
    setActionFeedback({ message, type });
    setTimeout(() => setActionFeedback({ message: "", type: "" }), 3000);
  };

  // Apply filters + alphabetical sort
  useEffect(() => {
    let u = [...allUsers];

    if (selectedClass !== "All") {
      u = u.filter((user) => user.Class === selectedClass);
    }

    if (selectedRole !== "All") {
      u = u.filter(
        (user) => user.role?.toLowerCase() === selectedRole.toLowerCase()
      );
    }

    if (selectedBatch !== "All") {
      u = u.filter((user) => user.batch === selectedBatch);
    }

    if (searchQuery.trim()) {
      u = u.filter((user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role + name (A-Z) sorting
    const rolePriority = { admin: 0, teacher: 1, student: 2 };
    u.sort((a, b) => {
      const roleA = a.role?.toLowerCase() || "student";
      const roleB = b.role?.toLowerCase() || "student";

      const roleDiff = rolePriority[roleA] - rolePriority[roleB];
      if (roleDiff !== 0) return roleDiff;

      return a.name.localeCompare(b.name);
    });

    setFilteredUsers(u);
    setCurrentPage(1);
  }, [allUsers, selectedClass, selectedRole, selectedBatch, searchQuery]);

  // Delete a user
  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    try {
      await deleteDoc(doc(db, "Users", user.id));
      setAllUsers((prev) => prev.filter((u) => u.id !== user.id));
      showFeedback(`${user.name} deleted successfully`);
    } catch (error) {
      showFeedback("Failed to delete user", "error");
    }
  };

  // Export handlers
  const handleExportPDF = () => {
    const pdf = new jsPDF();
    const rows = filteredUsers.map((u) => [
      u.uid,
      u.name,
      u.Class,
      u.phone,
      u.role,
    ]);
    autoTable(pdf, {
      head: [["UID", "Name", "Class", "Phone", "Role"]],
      body: rows,
    });
    pdf.save("users.pdf");
    showFeedback("PDF exported successfully");
  };

  const handleExportExcel = () => {
    const data = filteredUsers.map((u) => ({
      UID: u.uid,
      Name: u.name,
      Class: u.Class,
      Phone: u.phone,
      Role: u.role,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "users.xlsx");
    showFeedback("Excel file exported successfully");
  };

  const handleEditUser = (user) => {
    setEditUser({ ...user }); // Copy to avoid mutating state directly
  };

  // Change a user's role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "Users", userId), { role: newRole });
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      showFeedback("Role updated successfully");
    } catch (error) {
      showFeedback("Failed to update role", "error");
    }
  };

  const branchOptions = ["Lakshya", "Aadharshila", "Basic"];

  const handleBatchChange = async (userId, newBatch) => {
    try {
      await updateDoc(doc(db, "Users", userId), { batch: newBatch });
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, batch: newBatch } : u))
      );
      // Refresh the filtered users to show the update immediately
      const updatedUser = allUsers.find((u) => u.id === userId);
      if (updatedUser) {
        updatedUser.batch = newBatch;
        setFilteredUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, batch: newBatch } : u))
        );
      }
      showFeedback("Batch updated successfully");
    } catch (err) {
      console.error("Failed to update batch:", err);
      showFeedback("Could not update batch", "error");
    }
  };

  // Reset password
  const handleResetPassword = async (userId) => {
    const pw = prompt("Enter the new password:");
    if (!pw) return showFeedback("Password reset cancelled", "info");

    try {
      const salt = bcrypt.genSaltSync(12);
      const hash = bcrypt.hashSync(pw, salt);
      await updateDoc(doc(db, "Users", userId), { password: hash });
      showFeedback("Password updated successfully");
    } catch (error) {
      showFeedback("Failed to update password", "error");
    }
  };

  // Paginate
  const paginated = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleBackupUsers = async () => {
    if (!window.confirm("Backup all users to UsersBackup?")) return;
    try {
      const snap = await getDocs(collection(db, "Users"));
      for (const userDoc of snap.docs) {
        // write each user under the same ID into UsersBackup
        await setDoc(doc(db, "UsersBackup", userDoc.id), userDoc.data());
      }
      showFeedback("Users collection backed up successfully");
    } catch (err) {
      console.error("Backup failed:", err);
      showFeedback("Failed to backup users", "error");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6 bg-gray-50 min-h-screen"
    >
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="flex justify-between items-center"
      >
        <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
        <div className="flex space-x-2">
          {userRole === "admin" && (
            <>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => navigate("/student-dashboard/admin/create-user")}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition flex items-center space-x-1"
              >
                <span>➕</span>
                <span>Create User</span>
              </motion.button>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleBackupUsers}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-800 transition flex items-center space-x-1"
              >
                <span>📦</span>
                <span>Backup</span>
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* Feedback toast */}
      <AnimatePresence>
        {actionFeedback.message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
              actionFeedback.type === "error"
                ? "bg-red-500 text-white"
                : actionFeedback.type === "info"
                ? "bg-blue-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {actionFeedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Actions */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-5 rounded-xl shadow-md"
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Filters & Export
        </h3>
        <div className="flex flex-wrap gap-4 items-center">
          <motion.select
            variants={itemVariants}
            className="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            onChange={(e) => setSelectedClass(e.target.value)}
            value={selectedClass}
          >
            <option value="All">All Classes</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 11">Class 11</option>
          </motion.select>

          <motion.select
            variants={itemVariants}
            className="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            onChange={(e) => setSelectedRole(e.target.value)}
            value={selectedRole}
          >
            <option value="All">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </motion.select>

          <motion.select
            variants={itemVariants}
            className="border px-3 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            onChange={(e) => setSelectedBatch(e.target.value)}
            value={selectedBatch}
          >
            <option value="All">All Batches</option>
            {branchOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </motion.select>

          <motion.input
            variants={itemVariants}
            className="border px-3 py-2 rounded-lg shadow-sm w-56 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            placeholder="🔍 Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex gap-2 ml-auto">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleExportPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center space-x-1"
            >
              <span>📄</span>
              <span>PDF</span>
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleExportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition flex items-center space-x-1"
            >
              <span>📊</span>
              <span>Excel</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* User Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        {isLoading ? (
          <div className="p-10 flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <motion.tr variants={itemVariants}>
                  <th className="border-b px-1 py-3 text-sm text-gray-600 font-medium">
                    Sr.No
                  </th>
                  <th className="border-b px-4 py-3 text-sm text-gray-600 font-medium">
                    Name
                  </th>
                  <th className="border-b px-4 py-3 text-sm text-gray-600 font-medium">
                    Email
                  </th>
                  <th className="border-b px-7 py-3 text-sm text-gray-600 font-medium">
                    Class
                  </th>
                  <th className="border-b px-4 py-3 text-sm text-gray-600 font-medium">
                    Phone
                  </th>
                  <th className="border-b px-2 py-3 text-sm text-gray-600 font-medium">
                    Batch
                  </th>
                  <th className="border-b px-4 py-3 text-sm text-gray-600 font-medium">
                    Role
                  </th>
                  <th className="border-b px-4 py-3 text-sm text-gray-600 font-medium">
                    Actions
                  </th>
                </motion.tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginated.map((user, idx) => {
                    const srNo = (currentPage - 1) * usersPerPage + idx + 1;
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-indigo-50 transition-colors"
                      >
                        <td className="border-b px-4 py-3 text-center">
                          {srNo}
                        </td>
                        <td className="border-b px-4 py-3 font-medium">
                          {user.name}
                        </td>
                        <td className="border-b px-4 py-3 text-gray-600">
                          {user.email || "—"}
                        </td>
                        <td className="border-b px-4 py-3 text-gray-600">
                          {user.Class}
                        </td>
                        <td className="border-b px-4 py-3 text-gray-600">
                          {user.phone}
                        </td>

                        {/* Batch cell */}
                        <td className="border-b px-4 py-3">
                          {userRole === "admin" ? (
                            <select
                              className="border px-2 py-1 rounded-md text-sm focus:ring-2 focus:ring-indigo-300 transition"
                              value={user.batch || ""}
                              onChange={(e) =>
                                handleBatchChange(user.id, e.target.value)
                              }
                            >
                              <option value="">— select —</option>
                              {branchOptions.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-gray-600">
                              {user.batch || "—"}
                            </span>
                          )}
                        </td>
                        <td className="border-b px-4 py-3">
                          {userRole === "admin" ? (
                            <select
                              className="border px-2 py-1 rounded-md text-sm focus:ring-2 focus:ring-indigo-300 transition"
                              value={user.role}
                              onChange={(e) =>
                                handleRoleChange(user.id, e.target.value)
                              }
                            >
                              <option value="student">Student</option>
                              <option value="teacher">Teacher</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "teacher"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="border-b px-4 py-3">
                          <div className="flex flex-wrap gap-2 justify-center">
                            {user.role === "student" && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="bg-amber-500 text-white px-3 py-1 rounded-md shadow-sm hover:bg-amber-600 transition text-sm"
                                >
                                  Attendance
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="bg-blue-500 text-white px-3 py-1 rounded-md shadow-sm hover:bg-blue-600 transition text-sm"
                                  onClick={() =>
                                    navigate("/student-dashboard/results")
                                  }
                                >
                                  Results
                                </motion.button>
                              </>
                            )}
                            {(user.role === "teacher" ||
                              user.role === "admin") && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-green-600 text-white px-3 py-1 rounded-md shadow-sm hover:bg-green-700 transition text-sm"
                                onClick={() =>
                                  navigate(
                                    `/student-dashboard/leaves?teacherId=${user.id}`
                                  )
                                }
                              >
                                View Leaves
                              </motion.button>
                            )}
                            {userRole === "admin" && (
                              <div className="flex flex-wrap gap-1">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="bg-indigo-600 text-white p-1 rounded-md shadow-sm hover:bg-indigo-700 transition"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
                                  </svg>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="bg-yellow-600 text-white p-1 rounded-md shadow-sm hover:bg-yellow-700 transition"
                                  onClick={() => handleResetPassword(user.id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                                  </svg>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="bg-red-600 text-white p-1 rounded-md shadow-sm hover:bg-red-700 transition"
                                  onClick={() => handleDelete(user)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                    />
                                  </svg>
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex justify-center mt-6 space-x-1"
      >
        {filteredUsers.length > 0 &&
          Array.from({
            length: Math.ceil(filteredUsers.length / usersPerPage),
          }).map((_, i) => (
            <motion.button
              key={i}
              variants={itemVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md shadow-sm transition-all ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white font-medium"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </motion.button>
          ))}
      </motion.div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative border border-gray-200"
            >
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-t-xl"></div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-5">
                  Edit User
                </h2>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold transition-all"
                onClick={() => setEditUser(null)}
              >
                ×
              </motion.button>

              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    value={editUser.name || ""}
                    placeholder="Full Name"
                    onChange={(e) =>
                      setEditUser({ ...editUser, name: e.target.value })
                    }
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    value={editUser.email || ""}
                    placeholder="Email Address"
                    onChange={(e) =>
                      setEditUser({ ...editUser, email: e.target.value })
                    }
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    value={editUser.phone || ""}
                    placeholder="Phone Number"
                    onChange={(e) =>
                      setEditUser({ ...editUser, phone: e.target.value })
                    }
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    value={editUser.Class}
                    onChange={(e) =>
                      setEditUser({ ...editUser, Class: e.target.value })
                    }
                  >
                    <option value="">Select Class</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                  </select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch
                  </label>
                  <select
                    className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    value={editUser.batch}
                    onChange={(e) =>
                      setEditUser({ ...editUser, batch: e.target.value })
                    }
                  >
                    <option value="">Select Batch</option>
                    <option value="Lakshya">Lakshya</option>
                    <option value="Aadharshila">Aadharshila</option>
                    <option value="Basic">Basic</option>
                  </select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    value={editUser.role}
                    onChange={(e) =>
                      setEditUser({ ...editUser, role: e.target.value })
                    }
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </motion.div>

                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg shadow-md hover:from-indigo-700 hover:to-blue-700 transition-all font-medium mt-6"
                  onClick={async () => {
                    try {
                      await updateDoc(doc(db, "Users", editUser.id), {
                        name: editUser.name || "",
                        email: editUser.email || "",
                        phone: editUser.phone || "",
                        Class: editUser.Class || "",
                        role: editUser.role || "student",
                        batch: editUser.batch || "",
                      });
                      setAllUsers((prev) =>
                        prev.map((u) =>
                          u.id === editUser.id ? { ...u, ...editUser } : u
                        )
                      );
                      setEditUser(null);
                      showFeedback("User updated successfully");
                    } catch (error) {
                      showFeedback("Failed to update user", "error");
                    }
                  }}
                >
                  Save Changes
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminUserManagement;
