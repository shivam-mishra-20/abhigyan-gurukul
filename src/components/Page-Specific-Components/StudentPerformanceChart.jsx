import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router";

const StudentPerformanceChart = () => {
  const navigate = useNavigate();

  const [chartData, setChartData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [individualSubjectData, setIndividualSubjectData] = useState({});
  const [loading, setLoading] = useState(true);

  const studentName = localStorage.getItem("studentName");
  const studentClass = localStorage.getItem("studentClass");

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const q = query(
          collection(db, "Results"),
          where("name", "==", studentName),
          where("class", "==", studentClass)
        );

        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => doc.data());

        if (results.length === 0) {
          setChartData([]);
          setSubjectData([]);
          return;
        }

        const sortedResults = results.sort(
          (a, b) => new Date(a.testDate) - new Date(b.testDate)
        );

        const mid = Math.floor(sortedResults.length / 2);
        const firstHalf = sortedResults.slice(0, mid);
        const secondHalf = sortedResults.slice(mid);

        // Calculate average percentage
        const calculateAveragePercentage = (arr) =>
          arr.length > 0
            ? parseFloat(
                (
                  arr.reduce(
                    (sum, r) =>
                      sum +
                      (parseFloat(r.marks || 0) / parseFloat(r.outOf || 100)) *
                        100,
                    0
                  ) / arr.length
                ).toFixed(2)
              )
            : 0;

        const avgBefore = calculateAveragePercentage(firstHalf);
        const avgAfter = calculateAveragePercentage(secondHalf);

        setChartData([
          { name: "Before", Percentage: avgBefore },
          { name: "After", Percentage: avgAfter },
        ]);

        const subjectTotals = {};
        const subjectWiseTestData = {};

        results.forEach((res) => {
          if (!res.subject) return;
          const sub = res.subject.trim();
          const marks = parseFloat(res.marks || 0);
          const outOf = parseFloat(res.outOf || 100);
          const percentage = outOf ? (marks / outOf) * 100 : 0;
          const testDate = res.testDate || "Unknown Date";

          if (!subjectTotals[sub]) {
            subjectTotals[sub] = { total: 0, count: 0 };
          }
          subjectTotals[sub].total += percentage;
          subjectTotals[sub].count += 1;

          if (!subjectWiseTestData[sub]) {
            subjectWiseTestData[sub] = [];
          }
          subjectWiseTestData[sub].push({ testDate, Percentage: percentage });
        });

        const subjectAverages = Object.keys(subjectTotals).map((subject) => ({
          subject,
          Percentage: parseFloat(
            (
              subjectTotals[subject].total / subjectTotals[subject].count
            ).toFixed(2)
          ),
        }));

        setSubjectData(subjectAverages);
        setIndividualSubjectData(subjectWiseTestData);
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [studentName, studentClass]);

  const getMinMax = (data) => {
    const percArray = data.map((d) => d.Percentage);
    return {
      min: Math.min(...percArray),
      max: Math.max(...percArray),
    };
  };

  const { min: minSubject, max: maxSubject } = getMinMax(subjectData);

  if (loading) return <p>Loading performance chart...</p>;
  if (!chartData.length) return <p>No performance data available.</p>;

  return (
    <div className="w-full space-y-10">
      {/* Overall and Subject Average Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Overall Before vs After */}
        <div className="h-[400px] bg-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
          <h2 className="text-xl font-bold mb-4 text-center">
            📈 Overall Improvement
          </h2>

          <ResponsiveContainer width="100%" height="70%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="5 5" stroke="#ccc" />
              <XAxis dataKey="name" padding={{ left: 10, right: 10 }} />
              <YAxis
                domain={[0, 100]}
                padding={{ top: 10, bottom: 10 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{ borderRadius: 10, fontSize: 14 }}
                formatter={(v) => `${v}%`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Percentage"
                stroke="#6366F1"
                strokeWidth={3}
                dot={{ r: 6, stroke: "#6366F1", strokeWidth: 2, fill: "white" }}
                activeDot={{ r: 10 }}
                isAnimationActive
              >
                <LabelList
                  dataKey="Percentage"
                  position="top"
                  formatter={(v) => `${v}%`}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>

          {/* View All Results Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => navigate("/student-dashboard/results")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2 px-4 rounded transition"
            >
              View All Results
            </button>
          </div>
        </div>

        {/* Subject-wise Average */}
        <div className="h-80 bg-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
          <h2 className="text-xl font-bold mb-4 text-center">
            📘 Subject-wise Average
          </h2>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart
              data={subjectData}
              margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="5 5" stroke="#ccc" />
              <XAxis dataKey="subject" padding={{ left: 10, right: 10 }} />
              <YAxis
                domain={[0, 100]}
                padding={{ top: 10, bottom: 10 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{ borderRadius: 10, fontSize: 14 }}
                formatter={(v) => `${v}%`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Percentage"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 6, stroke: "#10B981", strokeWidth: 2, fill: "white" }}
                activeDot={{ r: 10 }}
                isAnimationActive
              >
                <LabelList
                  dataKey="Percentage"
                  position="top"
                  formatter={(value) =>
                    value === minSubject
                      ? `⬇️ ${value}%`
                      : value === maxSubject
                      ? `⬆️ ${value}%`
                      : `${value}%`
                  }
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual Subject Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(individualSubjectData).map(([subject, data]) => (
          <div
            key={subject}
            className="h-72 bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col justify-between"
          >
            <h3 className="text-lg font-semibold mb-2 text-center">
              📚 {subject}
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#eee" />
                <XAxis
                  dataKey="testDate"
                  tick={{ fontSize: 10 }}
                  padding={{ left: 5, right: 5 }}
                />
                <YAxis
                  domain={[0, 100]}
                  padding={{ top: 10, bottom: 10 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, fontSize: 13 }}
                  formatter={(v) => `${v}%`}
                />
                <Line
                  type="monotone"
                  dataKey="Percentage"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{
                    r: 5,
                    stroke: "#3B82F6",
                    strokeWidth: 2,
                    fill: "white",
                  }}
                  activeDot={{ r: 8 }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentPerformanceChart;
