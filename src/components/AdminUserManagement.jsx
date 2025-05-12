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
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editUser, setEditUser] = useState(null); // null means modal hidden

  const usersPerPage = 9;
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "Users"));
      const users = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        batch: d.data().batch || "", // Ensure batch is always defined
      }));
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
    await deleteDoc(doc(db, "Users", user.id));
    setAllUsers((prev) => prev.filter((u) => u.id !== user.id));
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

  const handleEditUser = (user) => {
    setEditUser({ ...user }); // Copy to avoid mutating state directly
  };

  // Change a user’s role
  const handleRoleChange = async (userId, newRole) => {
    await updateDoc(doc(db, "Users", userId), { role: newRole });
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
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
    } catch (err) {
      console.error("Failed to update batch:", err);
      alert("❌ Could not update batch.");
    }
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

        <select
          className="border px-3 py-2 rounded"
          onChange={(e) => setSelectedBatch(e.target.value)}
          value={selectedBatch}
        >
          <option value="All">All Batches</option>
          {branchOptions.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
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
              <th className="border px-1 py-2">Sr.No</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-7 py-2">Class</th>

              <th className="border px-4 py-2">Phone</th>
              <th className="border px-2 py-2">Batch</th>

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

                    {/* Batch cell */}
                    <td className="border px-4 py-2">
                      {userRole === "admin" ? (
                        <select
                          className="border px-2 py-1 rounded"
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
                        user.batch || "—"
                      )}
                    </td>
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
                            className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-gray-200 transition"
                            onClick={() => handleEditUser(user)}
                          >
                            Edit
                          </button>
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
      {editUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-center text-green-700 mb-4">
              ✏️ Edit User
            </h2>
            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setEditUser(null)}
            >
              ×
            </button>

            <div className="space-y-4">
              {["name", "email", "phone"].map((field) => (
                <input
                  key={field}
                  type="text"
                  className="w-full border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                  value={editUser[field] || ""}
                  placeholder={field.toUpperCase()}
                  onChange={(e) =>
                    setEditUser({ ...editUser, [field]: e.target.value })
                  }
                />
              ))}

              <select
                className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400"
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

              <select
                className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400"
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

              <select
                className="w-full border px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-green-400"
                value={editUser.role}
                onChange={(e) =>
                  setEditUser({ ...editUser, role: e.target.value })
                }
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-green-600 text-white py-2 rounded-lg shadow-md hover:bg-green-700 transition-all font-semibold"
                onClick={async () => {
                  await updateDoc(doc(db, "Users", editUser.id), {
                    name: editUser.name,
                    email: editUser.email,
                    phone: editUser.phone,
                    Class: editUser.Class,
                    role: editUser.role,
                    batch: editUser.batch,
                  });
                  setAllUsers((prev) =>
                    prev.map((u) => (u.id === editUser.id ? editUser : u))
                  );
                  setEditUser(null);
                  alert("✅ User updated!");
                }}
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminUserManagement;
