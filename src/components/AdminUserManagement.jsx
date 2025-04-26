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
import { motion } from "framer-motion";

const AdminUserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 9;
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "Users"));
      const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      users.sort((a, b) => a.name.localeCompare(b.name));
      setAllUsers(users);
      setFilteredUsers(users);
    };
    fetchUsers();
  }, []);

  // Apply filters + alphabetical sort
  useEffect(() => {
    let u = [...allUsers];
    if (selectedClass !== "All") {
      u = u.filter((user) => user.Class === selectedClass);
    }
    if (selectedRole !== "All") {
      u = u.filter((user) => user.role === selectedRole);
    }
    if (searchQuery.trim()) {
      u = u.filter((user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    u.sort((a, b) => a.name.localeCompare(b.name));
    setFilteredUsers(u);
    setCurrentPage(1);
  }, [allUsers, selectedClass, selectedRole, searchQuery]);

  // Delete a user
  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    await deleteDoc(doc(db, "Users", user.id));
    setAllUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  // Clear ALL leaves
  // const handleClearLeaves = async () => {
  //   if (
  //     !window.confirm(
  //       "This will delete every document in teacherLeaves. Are you sure?"
  //     )
  //   )
  //     return;
  //   const snap = await getDocs(collection(db, "teacherLeaves"));
  //   for (const d of snap.docs) {
  //     await deleteDoc(doc(db, "teacherLeaves", d.id));
  //   }
  //   alert("✅ All teacher leaves cleared.");
  // };

  // // Initialize teacherLeaves for every teacher in Users
  // const handleInitTeacherLeaves = async () => {
  //   if (
  //     !window.confirm(
  //       "This will create/overwrite a teacherLeaves doc for each teacher in Users. Proceed?"
  //     )
  //   )
  //     return;
  //   // grab all teachers
  //   const snap = await getDocs(collection(db, "Users"));
  //   const teachers = snap.docs
  //     .map((d) => ({ id: d.id, ...d.data() }))
  //     .filter((u) => u.role === "teacher");
  //   // write into teacherLeaves
  //   for (const t of teachers) {
  //     await setDoc(
  //       doc(db, "teacherLeaves", t.id),
  //       { name: t.name, leaves: [] },
  //       { merge: true }
  //     );
  //   }
  //   alert("✅ teacherLeaves initialized for all teachers.");
  // };

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
  };

  // Change a user’s role
  const handleRoleChange = async (userId, newRole) => {
    await updateDoc(doc(db, "Users", userId), { role: newRole });
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  // Reset password
  const handleResetPassword = async (userId) => {
    const pw = prompt("Enter the new password:");
    if (!pw) return alert("Password reset cancelled.");
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(pw, salt);
    await updateDoc(doc(db, "Users", userId), { password: hash });
    alert("✅ Password updated.");
  };

  // Paginate
  const paginated = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // 👇 above your return(), inside AdminUserManagement:
  const handleBackupUsers = async () => {
    if (!window.confirm("Backup all users to UsersBackup?")) return;
    try {
      const snap = await getDocs(collection(db, "Users"));
      for (const userDoc of snap.docs) {
        // write each user under the same ID into UsersBackup
        await setDoc(doc(db, "UsersBackup", userDoc.id), userDoc.data());
      }
      alert("✅ Users collection backed up successfully!");
    } catch (err) {
      console.error("Backup failed:", err);
      alert("❌ Failed to backup users.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Admin User Management</h2>

      {/* Filters & Actions */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          className="border px-3 py-2 rounded"
          onChange={(e) => setSelectedClass(e.target.value)}
          value={selectedClass}
        >
          <option value="All">All Classes</option>
          <option value="Class 8">Class 8</option>
          <option value="Class 9">Class 9</option>
          <option value="Class 10">Class 10</option>
          <option value="Class 11">Class 11</option>
        </select>

        <select
          className="border px-3 py-2 rounded"
          onChange={(e) => setSelectedRole(e.target.value)}
          value={selectedRole}
        >
          <option value="All">All Roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <input
          className="border px-3 py-2 rounded w-56"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button
          onClick={handleExportPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Export PDF
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Export Excel
        </button>

        {userRole === "admin" && (
          <>
            <button
              onClick={() => navigate("/student-dashboard/admin/create-user")}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            >
              Create User
            </button>
            {/* <button
              onClick={handleClearLeaves}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Clear All Leaves
            </button> */}
            {/* <button
              onClick={handleInitTeacherLeaves}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Init Teacher Leaves
            </button> */}
            {/* ← New Backup button */}
            <button
              onClick={handleBackupUsers}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              📦 Backup Users
            </button>
          </>
        )}
      </div>

      {/* User Table */}
      <div className="overflow-x-auto rounded shadow">
        <table className="min-w-full border-collapse bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Sr.No</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Class</th>
              <th className="border px-4 py-2">Phone</th>
              <th className="border px-4 py-2">Role</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No users found.
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
                    className="hover:bg-gray-200 transition-colors"
                  >
                    <td className="border px-4 py-2">{srNo}</td>
                    <td className="border px-4 py-2">{user.name}</td>
                    <td className="border px-4 py-2">{user.email || "—"}</td>
                    <td className="border px-4 py-2">{user.Class}</td>
                    <td className="border px-4 py-2">{user.phone}</td>
                    <td className="border px-4 py-2">
                      {userRole === "admin" ? (
                        <select
                          className="border px-2 py-1 rounded"
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
                        user.role
                      )}
                    </td>
                    <td className="border px-4 py-2 flex flex-wrap gap-2 justify-center">
                      {user.role === "student" && (
                        <>
                          <button className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-gray-200 transition">
                            Attendance
                          </button>
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-gray-200 transition"
                            onClick={() =>
                              navigate("/student-dashboard/results")
                            }
                          >
                            Results
                          </button>
                        </>
                      )}
                      {(user.role === "teacher" || user.role === "admin") && (
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-gray-200 transition"
                          onClick={() =>
                            navigate(
                              `/student-dashboard/leaves?teacherId=${user.id}`
                            )
                          }
                        >
                          View Leaves
                        </button>
                      )}
                      {userRole === "admin" && (
                        <>
                          <button
                            className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-gray-200 transition"
                            onClick={() => handleResetPassword(user.id)}
                          >
                            Reset Password
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-gray-200 transition"
                            onClick={() => handleDelete(user)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({
          length: Math.ceil(filteredUsers.length / usersPerPage),
        }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminUserManagement;
