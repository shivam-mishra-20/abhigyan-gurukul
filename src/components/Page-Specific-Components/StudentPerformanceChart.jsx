import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Example data format (you can fetch this from props or backend)
const COLORS = ["#00C49F", "#FF8042"];

const StudentPerformanceChart = ({ previous, current }) => {
  const improved = current > previous;
  const improvement = Math.abs(current - previous);

  const data = [
    { name: improved ? "Improved" : "Declined", value: improvement },
    { name: "Previous Score", value: previous },
  ];

  return (
    <div className="w-full h-64">
      <h2 className="text-xl font-semibold mb-2">📊 Performance Overview</h2>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentPerformanceChart;
