import React, { useEffect, useState } from "react";
import { getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router";

const AdminUserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const collections = ["students", "teachers", "admins"];
      let users = [];

      for (const col of collections) {
        const snapshot = await getDocs(collection(db, col));
        snapshot.forEach((docSnap) => {
          users.push({ ...docSnap.data(), id: docSnap.id });
        });
      }

      setAllUsers(users);
      setFilteredUsers(users);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let users = allUsers;

    if (selectedClass !== "All") {
      users = users.filter((user) => user.Class === selectedClass);
    }

    if (selectedRole !== "All") {
      users = users.filter((user) => user.role === selectedRole);
    }

    if (searchQuery.trim()) {
      users = users.filter((user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(users);
    setCurrentPage(1);
  }, [selectedClass, selectedRole, searchQuery, allUsers]);

  const handleDelete = async (user) => {
    const collectionName =
      user.role === "student"
        ? "students"
        : user.role === "teacher"
        ? "teachers"
        : "admins";

    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      await deleteDoc(doc(db, collectionName, user.id));
      setAllUsers((prev) => prev.filter((u) => u.id !== user.id));
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear ALL user records?")) {
      const collections = ["students", "teachers", "admins"];
      for (const col of collections) {
        const snap = await getDocs(collection(db, col));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, col, d.id));
        }
      }
      setAllUsers([]);
      setFilteredUsers([]);
    }
  };

  const handleExportPDF = () => {
    const tableData = filteredUsers.map((user) => [
      user.uid,
      user.name,
      user.Class,
      user.phone,
      user.role,
    ]);

    autoTable(pdf, {
      head: [["UID", "Name", "Class", "Phone", "Role"]],
      body: tableData,
    });

    pdf.save("users.pdf");
  };

  const handleExportExcel = () => {
    const data = filteredUsers.map(({ uid, name, Class, phone, role }) => ({
      UID: uid,
      Name: name,
      Class,
      Phone: phone,
      Role: role,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Admin User Management
      </h2>

      <div className="flex flex-wrap gap-4 items-center mb-6">
        <select
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border px-3 py-2 rounded shadow-sm"
        >
          <option value="All">All Classes</option>
          <option value="Class 8">Class 8</option>
          <option value="Class 9">Class 9</option>
          <option value="Class 10">Class 10</option>
          <option value="Class 11">Class 11</option>
        </select>

        <select
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border px-3 py-2 rounded shadow-sm"
        >
          <option value="All">All Roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded w-52 shadow-sm"
        />

        <button
          onClick={handleExportPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Export as PDF
        </button>

        <button
          onClick={handleExportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Export as Excel
        </button>

        <button
          onClick={() => navigate("/student-dashboard/admin/create-user")}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Create User
        </button>

        <button
          onClick={handleClearAll}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Clear All Records (Dev)
        </button>
      </div>

      <div className="overflow-x-auto rounded shadow">
        <table className="min-w-full border border-gray-300 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">UID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Class</th>
              <th className="border px-4 py-2">Phone</th>
              <th className="border px-4 py-2">Role</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="border px-4 py-2">{user.uid}</td>
                  <td className="border px-4 py-2">{user.name}</td>
                  <td className="border px-4 py-2">{user.Class}</td>
                  <td className="border px-4 py-2">{user.phone}</td>
                  <td className="border px-4 py-2 capitalize">{user.role}</td>
                  <td className="border px-4 py-2 flex flex-wrap gap-2 justify-center">
                    {user.role === "student" && (
                      <button className="bg-amber-500 text-white px-3 py-1 rounded text-sm hover:bg-amber-600 transition">
                        View Attendance
                      </button>
                    )}
                    {user.role === "teacher" && (
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition">
                        View Leaves
                      </button>
                    )}
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                      onClick={() => handleDelete(user)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({
          length: Math.ceil(filteredUsers.length / usersPerPage),
        }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded transition ${
              currentPage === index + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminUserManagement;
