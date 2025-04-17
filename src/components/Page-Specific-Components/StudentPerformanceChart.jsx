import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const StudentPerformanceChart = () => {
  const [chartData, setChartData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
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

        // Sort by date
        const sorted = results.sort(
          (a, b) => new Date(a.testDate) - new Date(b.testDate)
        );
        const mid = Math.floor(sorted.length / 2);
        const firstHalf = sorted.slice(0, mid);
        const secondHalf = sorted.slice(mid);

        const average = (arr) =>
          arr.length > 0
            ? parseFloat(
                (
                  arr.reduce((sum, r) => sum + parseFloat(r.marks || 0), 0) /
                  arr.length
                ).toFixed(2)
              )
            : 0;

        const avgBefore = average(firstHalf);
        const avgAfter = average(secondHalf);

        setChartData([
          { name: "Before", Marks: avgBefore },
          { name: "After", Marks: avgAfter },
        ]);

        // 🎯 Subject-wise aggregation
        const subjectMap = {};

        results.forEach((res) => {
          if (!res.subject) return;

          const sub = res.subject.trim();
          const marks = parseFloat(res.marks || 0);
          if (!subjectMap[sub]) {
            subjectMap[sub] = { total: 0, count: 0 };
          }
          subjectMap[sub].total += marks;
          subjectMap[sub].count += 1;
        });

        const subjectAverages = Object.keys(subjectMap).map((subject) => ({
          subject,
          Marks: parseFloat(
            (subjectMap[subject].total / subjectMap[subject].count).toFixed(2)
          ),
        }));

        setSubjectData(subjectAverages);
      } catch (err) {
        console.error("Error fetching performance data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [studentName, studentClass]);

  if (loading) return <p>Loading performance chart...</p>;
  if (!chartData.length) return <p>No performance data available.</p>;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Before vs After */}
        <div className="h-72 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">📊 Overall Performance</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Marks" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subject-wise Averages */}
        <div className="h-72 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">
            📘 Subject-wise Performance
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Marks" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default StudentPerformanceChart;
