import React from "react";
import {
  FaUsers,
  FaUserCheck,
  FaCalendarAlt,
  FaUserPlus,
  FaFileExport,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router";

const AdminDashboardOverview = () => {
  const navigate = useNavigate();

  // Dummy data — replace with Firestore later
  const stats = {
    totalUsers: 500,
    presentToday: 450,
    pendingLeaves: 3,
    newRegistrations: 7,
  };

  const recentActivity = [
    "Teacher Ramesh requested leave",
    "Student Aditi was marked absent",
    "New user added to Class 8",
  ];

  return (
    <div className="p-6 animate-fadeIn space-y-6 transition-all duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Welcome back, Admin 👋
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-100 text-blue-800 p-4 rounded shadow flex items-center gap-4 hover:scale-105 transition">
          <FaUsers className="text-2xl" />
          <div>
            <p className="text-lg font-semibold">{stats.totalUsers}</p>
            <p>Total Users</p>
          </div>
        </div>
        <div className="bg-green-100 text-green-800 p-4 rounded shadow flex items-center gap-4 hover:scale-105 transition">
          <FaUserCheck className="text-2xl" />
          <div>
            <p className="text-lg font-semibold">{stats.presentToday}</p>
            <p>Present Today</p>
          </div>
        </div>
        <div className="bg-red-100 text-red-800 p-4 rounded shadow flex items-center gap-4 hover:scale-105 transition">
          <FaCalendarAlt className="text-2xl" />
          <div>
            <p className="text-lg font-semibold">{stats.pendingLeaves}</p>
            <p>Pending Leaves</p>
          </div>
        </div>
        <div className="bg-purple-100 text-purple-800 p-4 rounded shadow flex items-center gap-4 hover:scale-105 transition">
          <FaUserPlus className="text-2xl" />
          <div>
            <p className="text-lg font-semibold">{stats.newRegistrations}</p>
            <p>New Registrations</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Recent Activity
        </h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {recentActivity.map((activity, index) => (
            <li key={index}>{activity}</li>
          ))}
        </ul>
      </div>

      {/* Admin Tools */}
    </div>
  );
};

export default AdminDashboardOverview;
