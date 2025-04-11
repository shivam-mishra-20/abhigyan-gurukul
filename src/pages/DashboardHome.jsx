import React from "react";
import { useNavigate } from "react-router";
import StudentPerformanceChart from "../components/Page-Specific-Components/StudentPerformanceChart";
import { FaUserShield, FaUsers, FaChalkboardTeacher } from "react-icons/fa";

const DashboardHome = ({ name, studentClass }) => {
  const role = localStorage.getItem("userRole");
  const navigate = useNavigate();

  const previousScore = 65; // Example data — replace with real values later
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
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome, {name}!</h1>

      {/* Student View */}
      {role === "student" && (
        <div className="h-[200px] grid grid-cols-5 gap-4 mb-6">
          {/* Pie Chart - Left Side */}
          <div className="col-span-3 h-[350px] bg-white p-4 shadow rounded">
            <StudentPerformanceChart
              previous={previousScore}
              current={currentScore}
            />
          </div>

          {/* Performance Summary - Right Side */}
          <div className="col-span-2 bg-white p-4 shadow rounded">
            <h2 className="text-lg font-semibold mb-2">Performance Summary</h2>
            <p>
              Your latest score shows{" "}
              {currentScore - previousScore >= 0
                ? "an improvement"
                : "a decline"}{" "}
              of {Math.abs(currentScore - previousScore)} points compared to
              your previous performance.
            </p>
          </div>
        </div>
      )}

      {/* Teacher View */}
      {role === "teacher" && (
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold mb-2">Teacher Dashboard</h2>
          <p>👨‍🏫 You are logged in as a teacher.</p>
        </div>
      )}

      {/* Admin View */}
      {role === "admin" && (
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>
          <p className="mb-6">🛠️ You are logged in as an admin.</p>

          {/* Admin Widgets with Navigation and Animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adminCards.map((card, index) => (
              <div
                key={index}
                onClick={() => navigate(card.route)}
                className={`cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg ${card.bg} p-4 rounded flex items-center gap-4 `}
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
