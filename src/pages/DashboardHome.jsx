import React from "react";
import { useNavigate } from "react-router";
import StudentPerformanceChart from "../components/Page-Specific-Components/StudentPerformanceChart";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaClipboardList,
  FaUserEdit,
} from "react-icons/fa";

const DashboardHome = ({ name }) => {
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
    <div className="space-y-10 px-4 md:px-10 py-6">
      <h1 className="text-2xl font-bold">Welcome, {name}!</h1>

      {/* STUDENT VIEW */}
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

          <div className="grid h-[350px] grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white h-full p-4  shadow rounded">
              <StudentPerformanceChart
                previous={previousScore}
                current={currentScore}
              />
            </div>
          </div>
        </>
      )}

      {/* TEACHER VIEW */}
      {role === "teacher" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card
            icon={<FaClipboardList className="text-2xl" />}
            title="Results"
            description="Manage or view student results"
            bg="bg-purple-100 text-purple-800"
            onClick={() => navigate("/student-dashboard/results")}
          />
          <Card
            icon={<FaChalkboardTeacher className="text-2xl" />}
            title="Leaves"
            description="Apply leave or view teacher leaves"
            bg="bg-green-100 text-green-800"
            onClick={() => navigate("/student-dashboard/leaves")}
          />
          <Card
            icon={<FaUserEdit className="text-2xl" />}
            title="Manage Users"
            description="Create, edit, delete users"
            bg="bg-blue-100 text-blue-800"
            onClick={() => navigate("/student-dashboard/admin/manage-users")}
          />
        </div>
      )}

      {/* ADMIN VIEW */}
      {role === "admin" && (
        <div className="bg-white p-6 shadow rounded space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Admin Dashboard</h2>
            <p className="text-gray-600">🛠️ You are logged in as an admin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adminCards.map((card, index) => (
              <Card
                key={index}
                icon={card.icon}
                title={card.title}
                description={card.description}
                bg={card.bg}
                onClick={() => navigate(card.route)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Card = ({ icon, title, description, onClick, bg }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer transition transform hover:scale-105 hover:shadow-md ${bg} p-4 rounded flex items-center gap-4`}
  >
    {icon}
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-gray-600">{description}</div>
    </div>
  </div>
);

export default DashboardHome;
