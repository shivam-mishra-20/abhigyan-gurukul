/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
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
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router";
import StudentComplaintsWidget from "../StudentComplaintsWidget";

// Custom hook for responsive design
const useResponsiveDisplay = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};

const StudentPerformanceChart = () => {
  const navigate = useNavigate();
  const isMobile = useResponsiveDisplay();

  const [chartData, setChartData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [individualSubjectData, setIndividualSubjectData] = useState({});
  const [loading, setLoading] = useState(true);

  const studentName = localStorage.getItem("studentName");
  const studentClass = localStorage.getItem("studentClass");

  // Color palette for consistent design
  const colors = {
    primary: "#4f46e5",
    secondary: "#10B981",
    accent: "#f59e0b",
    background: "#f8fafc",
    success: "#047857",
    error: "#dc2626",
    chartColors: [
      "#4f46e5",
      "#10B981",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
      "#0ea5e9",
    ],
  };

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
          { name: "Before", Percentage: avgBefore, fill: colors.error },
          { name: "After", Percentage: avgAfter, fill: colors.success },
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
          subjectWiseTestData[sub].push({
            testDate,
            Percentage: percentage,
            formattedDate: new Date(testDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          });
        });

        // Generate subject averages with consistent colors
        const subjectAverages = Object.keys(subjectTotals).map(
          (subject, index) => ({
            subject,
            Percentage: parseFloat(
              (
                subjectTotals[subject].total / subjectTotals[subject].count
              ).toFixed(2)
            ),
            fill: colors.chartColors[index % colors.chartColors.length],
            // Add additional properties for 3D effect
            outerRadius: 70 + Math.random() * 10,
            innerRadius: 40 - Math.random() * 5,
            cornerRadius: 4 + Math.random() * 3,
            stroke: colors.chartColors[index % colors.chartColors.length],
            strokeWidth: 1,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            shadowBlur: 5,
            shadowOpacity: 0.3,
          })
        );

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

  // Custom function to truncate subject names for mobile
  const truncateSubject = (subject, maxLength = 8) => {
    return subject.length > maxLength
      ? `${subject.substring(0, maxLength)}...`
      : subject;
  };

  // Custom render function for 3D pie chart effects
  const renderActiveShape = (props) => {
    const {
      cx,
      cy,

      innerRadius,
      outerRadius,

      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;

    return (
      <g>
        <defs>
          <filter
            id={`shadow-${payload.subject}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="3"
              floodOpacity="0.3"
              floodColor="#000"
            />
          </filter>
          <linearGradient
            id={`grad-${payload.subject}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={fill} stopOpacity={1} />
            <stop offset="100%" stopColor={fill} stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <g filter={`url(#shadow-${payload.subject})`}>
          <path
            d={`M${cx},${cy}L${cx},${cy - outerRadius}
              A${outerRadius},${outerRadius},0,0,1,${
              cx + Math.sin(endAngle) * outerRadius
            },${cy - Math.cos(endAngle) * outerRadius}
              Z`}
            fill={`url(#grad-${payload.subject})`}
          />
        </g>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-lg border border-gray-100">
          <p className="font-semibold">{`${label}`}</p>
          <p className="text-sm text-gray-700">
            <span className="font-medium text-indigo-600">{`${payload[0].value.toFixed(
              1
            )}%`}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-indigo-600 font-medium">
          Loading performance data...
        </div>
      </div>
    );

  if (!chartData.length)
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-lg text-gray-600">
          No performance data available yet.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Test results will appear here once available.
        </p>
      </div>
    );

  // Desktop view rendering
  const renderDesktopView = () => (
    <div className="w-full space-y-10 pb-10">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl mb-8">
        <h1 className="text-2xl font-bold text-indigo-900 text-center">
          {studentName}'s Performance Dashboard
        </h1>
        <p className="text-center text-gray-600">Class: {studentClass}</p>
      </div>

      {/* Overall and Subject Average Charts */}
      <div className="grid grid-cols-2 gap-8">
        {/* Overall Before vs After */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📈</span> Overall Improvement
          </h2>

          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis
                  domain={[0, 100]}
                  padding={{ top: 10, bottom: 0 }}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="Percentage"
                  fill={colors.primary}
                  radius={[10, 10, 0, 0]}
                  barSize={80}
                >
                  <LabelList
                    dataKey="Percentage"
                    position="top"
                    formatter={(v) => `${v}%`}
                    style={{ fontWeight: 500 }}
                    fill="#4f46e5"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate("/student-dashboard/results")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 px-5 rounded-lg transition shadow-sm hover:shadow flex items-center justify-center space-x-1"
            >
              <span>View All Results</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Subject-wise Average */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📊</span> Subject-wise Performance
          </h2>

          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={subjectData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <defs>
                  <linearGradient
                    id="colorPercentage"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={colors.secondary}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors.secondary}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="subject"
                  axisLine={false}
                  tickLine={false}
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis
                  domain={[0, 100]}
                  padding={{ top: 10, bottom: 0 }}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Percentage"
                  stroke={colors.secondary}
                  fillOpacity={1}
                  fill="url(#colorPercentage)"
                  strokeWidth={3}
                  activeDot={{ r: 8, strokeWidth: 0 }}
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
                    style={{ fontWeight: 500 }}
                    fill={colors.secondary}
                  />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Individual Subject Charts */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
          <span className="mr-2">📚</span> Subject Progression
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {Object.entries(individualSubjectData).map(
            ([subject, data], index) => {
              // Calculate improvement trend if there are multiple entries
              const hasMultipleEntries = data.length > 1;
              const firstScore = hasMultipleEntries ? data[0].Percentage : 0;
              const lastScore = hasMultipleEntries
                ? data[data.length - 1].Percentage
                : 0;
              const improvement = lastScore - firstScore;
              const isImproving = improvement > 0;

              // Calculate overall average
              const average =
                data.reduce((sum, item) => sum + item.Percentage, 0) /
                data.length;

              return (
                <div
                  key={subject}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center justify-between">
                    <span>{subject}</span>
                    <span className="text-sm bg-indigo-100 text-indigo-800 py-1 px-2 rounded-full">
                      {data.length} {data.length === 1 ? "test" : "tests"}
                    </span>
                  </h3>

                  {/* Subject stats */}
                  {hasMultipleEntries && (
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="flex items-center">
                        <span className="font-medium">Avg: </span>
                        <span className="ml-1 text-gray-700">
                          {average.toFixed(1)}%
                        </span>
                      </span>

                      <span
                        className={`flex items-center ${
                          isImproving ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isImproving ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 11l5-5m0 0l5 5m-5-5v12"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 13l-5 5m0 0l-5-5m5 5V6"
                            />
                          </svg>
                        )}
                        <span className="font-medium">
                          {Math.abs(improvement).toFixed(1)}%
                        </span>
                      </span>
                    </div>
                  )}

                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data}
                        margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient
                            id={`colorGrad-${index}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={
                                colors.chartColors[
                                  index % colors.chartColors.length
                                ]
                              }
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor={
                                colors.chartColors[
                                  index % colors.chartColors.length
                                ]
                              }
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f0f0f0"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="formattedDate"
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          stroke="#64748b"
                        />
                        <YAxis
                          domain={[0, 100]}
                          tickFormatter={(v) => `${v}`}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11 }}
                          stroke="#64748b"
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            fontSize: 12,
                            padding: "8px 12px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(v) => [`${v.toFixed(1)}%`, "Score"]}
                          labelFormatter={(v) => `Test: ${v}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="Percentage"
                          stroke="none"
                          fill={`url(#colorGrad-${index})`}
                          fillOpacity={1}
                        />
                        <Line
                          type="monotone"
                          dataKey="Percentage"
                          stroke={
                            colors.chartColors[
                              index % colors.chartColors.length
                            ]
                          }
                          strokeWidth={3}
                          dot={{
                            r: 4,
                            stroke:
                              colors.chartColors[
                                index % colors.chartColors.length
                              ],
                            strokeWidth: 2,
                            fill: "white",
                          }}
                          activeDot={{
                            r: 7,
                            strokeWidth: 0,
                            fill: colors.chartColors[
                              index % colors.chartColors.length
                            ],
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Range indicators */}
                  {data.length > 0 && (
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">Min</span>
                        <span>
                          {Math.min(...data.map((d) => d.Percentage)).toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-[2px] flex-1 mx-2 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300"></div>
                      <div className="flex flex-col items-center">
                        <span className="font-medium">Max</span>
                        <span>
                          {Math.max(...data.map((d) => d.Percentage)).toFixed(
                            1
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Complaints Widget - Desktop (End Position) */}
      <div className="mt-10 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">⚠️</span> Complaints & Notices
        </h2>
        <StudentComplaintsWidget />
      </div>
    </div>
  );

  // Mobile view rendering
  const renderMobileView = () => (
    <div className="w-full space-y-6 pb-8">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl">
        <h1 className="text-lg font-bold text-indigo-900 text-center">
          {studentName}'s Performance
        </h1>
        <p className="text-center text-gray-600 text-sm">
          Class: {studentClass}
        </p>
      </div>

      {/* Overall Performance - Mobile */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-md font-bold mb-3 text-gray-800 flex items-center">
          <span className="mr-1">📈</span> Overall Improvement
        </h2>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: -15, bottom: 0 }}
              barSize={40}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                fontSize={10}
                stroke="#64748b"
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
                fontSize={10}
                stroke="#64748b"
              />
              <Tooltip
                contentStyle={{ fontSize: 10, padding: "6px 8px" }}
                formatter={(v) => [`${v}%`, "Score"]}
              />
              <Bar
                dataKey="Percentage"
                fill={colors.primary}
                radius={[5, 5, 0, 0]}
              >
                <LabelList
                  dataKey="Percentage"
                  position="top"
                  formatter={(v) => `${v}%`}
                  style={{ fontSize: 10, fontWeight: 500 }}
                  fill="#4f46e5"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center mt-3">
          <button
            onClick={() => navigate("/student-dashboard/results")}
            className="bg-indigo-600 text-white text-xs py-2 px-3 rounded-md flex items-center space-x-1"
          >
            <span>All Results</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Subject Averages - Mobile */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-md font-bold mb-3 text-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-1">📊</span> Subject Performance
          </div>
        </h2>

        {/* 3D Pie Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter
                  id="shadow-3d"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feOffset dx="0" dy="3" />
                  <feGaussianBlur stdDeviation="3" result="shadow" />
                  <feFlood floodColor="#333" floodOpacity="0.2" />
                  <feComposite in2="shadow" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {subjectData.map((entry, index) => (
                  <linearGradient
                    key={`gradient-${index}`}
                    id={`colorGradient-${index}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={
                        colors.chartColors[index % colors.chartColors.length]
                      }
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="100%"
                      stopColor={
                        colors.chartColors[index % colors.chartColors.length]
                      }
                      stopOpacity={0.7}
                    />
                  </linearGradient>
                ))}
              </defs>

              <Pie
                data={subjectData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={65}
                paddingAngle={4}
                dataKey="Percentage"
                nameKey="subject"
                filter="url(#shadow-3d)"
                startAngle={90}
                endAngle={-270}
                activeShape={renderActiveShape}
              >
                {subjectData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#colorGradient-${index})`}
                    stroke={
                      colors.chartColors[index % colors.chartColors.length]
                    }
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
                contentStyle={{
                  fontSize: 10,
                  padding: "6px 8px",
                  borderRadius: "6px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Legend */}
        <div className="grid grid-cols-2 gap-1 mt-2 mb-3">
          {subjectData.map((subject, index) => (
            <div key={index} className="flex items-center text-xs">
              <span
                className="h-2 w-2 mr-1 rounded-full"
                style={{
                  backgroundColor:
                    colors.chartColors[index % colors.chartColors.length],
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              />
              <span className="truncate">{subject.subject}</span>
              <span className="ml-1 font-medium">{subject.Percentage}%</span>
            </div>
          ))}
        </div>

        {/* Complementary Line Graph */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <h3 className="text-xs font-medium text-gray-700 mb-2">
            Subject Performance Trend
          </h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={subjectData}
                margin={{ top: 10, right: 5, left: 0, bottom: 15 }}
              >
                <defs>
                  <linearGradient
                    id="mobileColorPercentage"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={colors.secondary}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors.secondary}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 9 }}
                  tickFormatter={truncateSubject}
                  axisLine={{ stroke: "#e0e0e0" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  padding={{ top: 10, bottom: 0 }}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 9 }}
                  width={30}
                  axisLine={{ stroke: "#e0e0e0" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    fontSize: 10,
                    padding: "6px 8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                  formatter={(v) => [`${v.toFixed(1)}%`, "Score"]}
                />
                <Area
                  type="monotone"
                  dataKey="Percentage"
                  stroke={colors.secondary}
                  fillOpacity={1}
                  fill="url(#mobileColorPercentage)"
                  strokeWidth={2}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                >
                  <LabelList
                    dataKey="Percentage"
                    position="top"
                    formatter={(value) =>
                      value === minSubject || value === maxSubject
                        ? `${value}%`
                        : ""
                    }
                    style={{ fontSize: 8, fontWeight: 500 }}
                    fill={colors.secondary}
                  />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Individual Subject Charts - Mobile Accordion */}
      <div className="mt-4 space-y-3">
        <h2 className="text-md font-bold text-gray-800 flex items-center">
          <span className="mr-1">📚</span> Subject Details
        </h2>

        {Object.entries(individualSubjectData).map(([subject, data], index) => {
          // Calculate improvement trend if there are multiple entries
          const hasMultipleEntries = data.length > 1;
          const firstScore = hasMultipleEntries ? data[0].Percentage : 0;
          const lastScore = hasMultipleEntries
            ? data[data.length - 1].Percentage
            : 0;
          const improvement = lastScore - firstScore;
          const isImproving = improvement > 0;

          return (
            <div
              key={subject}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <h3 className="text-sm font-semibold mb-2 text-gray-800 flex items-center justify-between">
                <span>{subject}</span>
                <div className="flex items-center">
                  {hasMultipleEntries && (
                    <span
                      className={`flex items-center mr-2 text-xs ${
                        isImproving ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isImproving ? "↑" : "↓"}
                      <span className="ml-0.5">
                        {Math.abs(improvement).toFixed(1)}%
                      </span>
                    </span>
                  )}
                  <span className="text-xs bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full">
                    {data.length} {data.length === 1 ? "test" : "tests"}
                  </span>
                </div>
              </h3>
              <div className="h-[130px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id={`mobileColorGrad-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={
                            colors.chartColors[
                              index % colors.chartColors.length
                            ]
                          }
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor={
                            colors.chartColors[
                              index % colors.chartColors.length
                            ]
                          }
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="formattedDate"
                      tick={{ fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}`}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9 }}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 10, padding: "4px 6px" }}
                      formatter={(v) => [`${v.toFixed(1)}%`, "Score"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="Percentage"
                      stroke="none"
                      fill={`url(#mobileColorGrad-${index})`}
                      fillOpacity={1}
                    />
                    <Line
                      type="monotone"
                      dataKey="Percentage"
                      stroke={
                        colors.chartColors[index % colors.chartColors.length]
                      }
                      strokeWidth={2}
                      dot={{
                        r: 3,
                        stroke:
                          colors.chartColors[index % colors.chartColors.length],
                        strokeWidth: 1,
                        fill: "white",
                      }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Quick stats */}
              <div className="flex justify-between items-center mt-1 text-[10px] text-gray-500">
                <span>
                  Min: {Math.min(...data.map((d) => d.Percentage)).toFixed(1)}%
                </span>
                <span>
                  Avg:{" "}
                  {(
                    data.reduce((sum, item) => sum + item.Percentage, 0) /
                    data.length
                  ).toFixed(1)}
                  %
                </span>
                <span>
                  Max: {Math.max(...data.map((d) => d.Percentage)).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complaints Widget - Mobile (End Position) */}
      <div className="mt-6 pt-2">
        <h2 className="text-md font-bold mb-3 text-gray-800 flex items-center">
          <span className="mr-1">⚠️</span> Complaints & Notices
        </h2>
        <StudentComplaintsWidget />
      </div>
    </div>
  );

  return isMobile ? renderMobileView() : renderDesktopView();
};

export default StudentPerformanceChart;
