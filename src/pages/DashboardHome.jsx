import React from "react";
import { useNavigate } from "react-router";
import StudentPerformanceChart from "../components/Page-Specific-Components/StudentPerformanceChart";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaClipboardList,
  FaCheckCircle,
  FaUserEdit,
} from "react-icons/fa";

const DashboardHome = ({ name, studentClass }) => {
  const role = localStorage.getItem("userRole");
  const navigate = useNavigate();

  const previousScore = 65;
  const currentScore = 78;

  const adminCards = [
    {
      icon: <FaUsers className="text-3xl" />,
      title: "Manage Users",
      description: "Add, edit, delete users",
      bg: "bg-blue-100 text-blue-800",
      route: "/student-dashboard/admin/manage-users",
    },
    {
      icon: <FaChalkboardTeacher className="text-3xl" />,
      title: "Teacher Leaves",
      description: "Review leave records",
      bg: "bg-green-100 text-green-800",
      route: "/student-dashboard/leaves",
    },
  ];

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Welcome, {name}!</h1>

      {/* Student View */}
      {role === "student" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div
              onClick={() => navigate("/student-dashboard/results")}
              className="bg-purple-100 text-purple-800 p-4 rounded shadow flex items-center gap-4 cursor-pointer hover:scale-105 transition"
            >
              <FaClipboardList className="text-2xl" />
              <div>
                <div className="text-sm font-semibold">View Results</div>
                <div className="text-xs">Check your academic performance</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-4 shadow rounded">
              <StudentPerformanceChart
                previous={previousScore}
                current={currentScore}
              />
            </div>
          </div>
        </>
      )}

      {/* Teacher/Admin Quick Access Cards */}
      {role === "teacher" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div
            onClick={() => navigate("/student-dashboard/results")}
            className="bg-purple-100 text-purple-800 p-4 rounded shadow flex items-center gap-4 cursor-pointer hover:scale-105 transition"
          >
            <FaClipboardList className="text-2xl" />
            <div>
              <div className="text-sm font-semibold">Results</div>
              <div className="text-xs">Manage or view student results</div>
            </div>
          </div>

          <div
            onClick={() => navigate("/student-dashboard/leaves")}
            className="bg-green-100 text-green-800 p-4 rounded shadow flex items-center gap-4 cursor-pointer hover:scale-105 transition"
          >
            <FaChalkboardTeacher className="text-2xl" />
            <div>
              <div className="text-sm font-semibold">Leaves</div>
              <div className="text-xs">Apply leave or view teacher leaves</div>
            </div>
          </div>

          <div
            onClick={() => navigate("/student-dashboard/admin/manage-users")}
            className="bg-blue-100 text-blue-800 p-4 rounded shadow flex items-center gap-4 cursor-pointer hover:scale-105 transition"
          >
            <FaUserEdit className="text-2xl" />
            <div>
              <div className="text-sm font-semibold">Manage Users</div>
              <div className="text-xs">Create, edit, delete users</div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Widgets */}
      {role === "admin" && (
        <div className="bg-white p-6 shadow rounded space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Admin Dashboard</h2>
            <p className="text-gray-600">🛠️ You are logged in as an admin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adminCards.map((card, index) => (
              <div
                key={index}
                onClick={() => navigate(card.route)}
                className={`cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg ${card.bg} p-4 rounded flex items-center gap-4`}
              >
                {card.icon}
                <div>
                  <div className="text-sm font-semibold">{card.title}</div>
                  <div className="text-xs text-gray-600">
                    {card.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
