import React from "react";
import StudentPerformanceChart from "../components/Page-Specific-Components/StudentPerformanceChart";

const DashboardHome = ({ name, studentClass }) => {
  const role = localStorage.getItem("userRole");

  const previousScore = 65; // Example data — replace with real values later
  const currentScore = 78;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome, {name}!</h1>

      {role === "student" && (
        <div className="grid grid-cols-5 grid-rows-5 gap-4">
          {/* Pie Chart - Left Side */}
          <div className="col-span-2 row-span-3 bg-white p-4 shadow rounded">
            <StudentPerformanceChart
              previous={previousScore}
              current={currentScore}
            />
          </div>

          {/* Main Content - Right Side */}
          <div className="col-span-3 row-span-4 bg-white p-4 shadow rounded">
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

      {role === "teacher" && (
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold mb-2">Teacher Dashboard</h2>
          <p>👨‍🏫 You are logged in as a teacher.</p>
          {/* Add teacher-specific widgets here */}
        </div>
      )}

      {role === "admin" && (
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold mb-2">Admin Dashboard</h2>
          <p>🛠️ You are logged in as an admin.</p>
          {/* Add admin-specific widgets here */}
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
