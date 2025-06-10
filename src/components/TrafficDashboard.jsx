/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine,
  FaChartPie,
  FaChartBar,
  FaFilter,
  FaDownload,
  FaCalendarAlt,
  FaMobile,
  FaDesktop,
  FaGlobe,
  FaMapMarkerAlt,
  FaUserShield,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowUp,
  FaArrowDown,
  FaUser,
  FaUserFriends,
  FaSearch,
  FaSyncAlt,
  FaTable,
  FaChartArea,
} from "react-icons/fa";
import * as XLSX from "xlsx";

const TrafficDashboard = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("7days");
  const [activeTab, setActiveTab] = useState("overview");
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [pageViewsByPath, setPageViewsByPath] = useState([]);
  const [deviceStats, setDeviceStats] = useState([]);
  const [browserStats, setBrowserStats] = useState([]);
  const [osStats, setOsStats] = useState([]);
  const [dailyVisits, setDailyVisits] = useState([]);
  const [referrerStats, setReferrerStats] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hostFilter, setHostFilter] = useState("all"); // 'all', 'localhost', 'main'
  const [referrerFilter, setReferrerFilter] = useState("");

  const navigate = useNavigate();

  // Verify admin access first
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    if (userRole !== "admin") {
      setError(
        "Access Denied: You must be an administrator to view this page."
      );
      setLoading(false);
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
      fetchTrafficData();
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchTrafficData();
    }
  }, [dateRange, isAuthorized, hostFilter]);

  // Custom colors for charts - enhanced palette
  const COLORS = [
    "#4F46E5", // Indigo
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Violet
    "#06B6D4", // Cyan
    "#EC4899", // Pink
    "#6366F1", // Indigo lighter
  ];

  const fetchTrafficData = async () => {
    if (!isAuthorized) return;

    setLoading(true);
    setError(null);

    try {
      let startDate;
      const now = new Date();
      const endDate = new Date(now);

      // Calculate start date based on selected range
      switch (dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "7days":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30days":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90days":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
      }

      // Create Firestore query
      let trafficQuery = query(
        collection(db, "traffic_logs"),
        where("timestamp", ">=", Timestamp.fromDate(startDate)),
        where("timestamp", "<=", Timestamp.fromDate(endDate)),
        orderBy("timestamp", "desc")
      );
      if (hostFilter === "localhost") {
        trafficQuery = query(
          trafficQuery,
          where("host", "==", "localhost:5173")
        );
      } else if (hostFilter === "main") {
        trafficQuery = query(
          trafficQuery,
          where("host", "==", "abhigyangurukul.com")
        );
      }
      const snapshot = await getDocs(trafficQuery);
      const visitData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));

      setVisits(visitData);

      // Process the data
      processTrafficData(visitData);
    } catch (err) {
      console.error("Error fetching traffic data:", err);
      setError("Failed to load traffic data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const processTrafficData = (data) => {
    if (!data || data.length === 0) {
      return;
    }

    // Count unique visitors by session ID
    const uniqueSessions = new Set(data.map((visit) => visit.sessionId));
    setUniqueVisitors(uniqueSessions.size);

    // Process page views by path
    const pathCounts = {};
    data.forEach((visit) => {
      const path = visit.pathname || "/";
      pathCounts[path] = (pathCounts[path] || 0) + 1;
    });

    const pathData = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);

    setPageViewsByPath(pathData);

    // Process device types
    const deviceCounts = {};
    data.forEach((visit) => {
      const deviceType = visit.deviceType || "unknown";
      deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
    });

    const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({
      name,
      value,
    }));

    setDeviceStats(deviceData);

    // Process browser data
    const browserCounts = {};
    data.forEach((visit) => {
      const browser = visit.browser || "unknown";
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    });

    const browserData = Object.entries(browserCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    setBrowserStats(browserData);

    // Process OS data
    const osCounts = {};
    data.forEach((visit) => {
      const os = visit.os || "unknown";
      osCounts[os] = (osCounts[os] || 0) + 1;
    });

    const osData = Object.entries(osCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    setOsStats(osData);

    // Process daily visits
    const dailyCounts = {};

    data.forEach((visit) => {
      const date = visit.timestamp.toISOString().split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const dailyData = Object.entries(dailyCounts)
      .map(([date, count]) => ({
        date,
        visits: count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setDailyVisits(dailyData);

    // Process referrer data
    const referrerCounts = {};
    data.forEach((visit) => {
      let referrer = visit.referrer || "direct";

      // Extract domain from referrer URL
      if (referrer !== "direct" && referrer !== "") {
        try {
          const url = new URL(referrer);
          referrer = url.hostname;
        } catch (e) {
          // Invalid URL, keep as is
        }
      }

      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
    });

    const referrerData = Object.entries(referrerCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    setReferrerStats(referrerData);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      visits.map((visit) => ({
        Date: visit.timestamp.toLocaleString(),
        Path: visit.pathname,
        Referrer: visit.referrer,
        Device: visit.deviceType,
        Browser: visit.browser,
        OS: visit.os,
        ScreenWidth: visit.screenSize?.width,
        ScreenHeight: visit.screenSize?.height,
        Language: visit.language,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Traffic Data");

    // Generate filename with current date
    const fileName = `traffic_data_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    // Show feedback to the user
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3000);

    XLSX.writeFile(workbook, fileName);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Calculate change percentages for stats
  const getChangePercentage = (currentValue, totalVisits) => {
    // This is a placeholder - in a real scenario you'd compare with previous period
    const percentOfTotal =
      totalVisits > 0 ? (currentValue / totalVisits) * 100 : 0;
    return percentOfTotal > 50
      ? { value: percentOfTotal, isPositive: true }
      : { value: percentOfTotal, isPositive: false };
  };

  if (!isAuthorized) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FaExclamationTriangle className="mx-auto text-5xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This area is
            restricted to administrators only.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
          <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium text-xl">
            Loading analytics data...
          </p>
          <p className="mt-2 text-gray-500">
            Please wait while we gather your website traffic insights
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md bg-white p-10 rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchTrafficData}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center mx-auto"
          >
            <FaSyncAlt className="mr-2 animate-spin" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredVisits = referrerFilter
    ? visits.filter((visit) => {
        if (!visit.referrer && referrerFilter === "direct") return true;
        if (!visit.referrer) return false;
        try {
          const url = new URL(visit.referrer);
          return url.hostname === referrerFilter;
        } catch {
          return visit.referrer === referrerFilter;
        }
      })
    : visits;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto"
    >
      {/* Modernized Header with new color scheme and improved date filter */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 text-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-3xl font-bold flex items-center gap-3"
            >
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <FaChartLine className="text-blue-600 text-2xl" />
              </div>
              Website Traffic Analytics
            </motion.h1>
            <p className="mt-3 text-indigo-100 max-w-lg">
              Gain insights into your website's performance and visitor behavior
              with advanced analytics
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm p-3 rounded-xl shadow-inner">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto">
                  <label className="block text-xs text-indigo-900 mb-1 font-medium">
                    Date Range
                  </label>
                  <div className="relative">
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="appearance-none bg-white bg-opacity-10 border border-indigo-400 font-semibold text-indigo-900 w-full sm:w-auto px-4 py-2.5 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
                    >
                      <option value="today">Today</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="90days">Last 90 Days</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FaCalendarAlt className="text-indigo-800" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={fetchTrafficData}
                    className="bg-white bg-opacity-10 hover:bg-opacity-20 px-4 py-2.5 rounded-lg transition-all flex items-center justify-center w-full sm:w-auto"
                    title="Refresh Data"
                  >
                    <FaSyncAlt className="text-lg" />
                    <span className="ml-2">Refresh</span>
                  </button>

                  <button
                    onClick={exportToExcel}
                    className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2.5 rounded-lg transition-all flex items-center justify-center w-full sm:w-auto"
                  >
                    <FaDownload className="mr-2" /> Export
                  </button>
                </div>
              </div>
            </div>

            {/* Data period indicator */}
            <div className="mt-4 flex justify-end">
              <div className="inline-flex items-center bg-white bg-opacity-10 px-3 py-1.5 rounded-full text-sm">
                <FaInfoCircle className="mr-2 text-indigo-700" />
                <span className="text-indigo-900">
                  Showing data for:{" "}
                  <span className="font-semibold">
                    {dateRange === "today"
                      ? "Today"
                      : dateRange === "7days"
                      ? "Last 7 days"
                      : dateRange === "30days"
                      ? "Last 30 days"
                      : "Last 90 days"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-100 rounded-full -mt-10 -mr-10 opacity-50"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Total Page Views
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1 flex items-end">
                {visits.length}
                <span className="text-sm ml-2 font-normal text-gray-500">
                  views
                </span>
              </h3>

              <div className="mt-3 inline-flex items-center text-xs font-medium">
                <span
                  className={`flex items-center ${
                    getChangePercentage(visits.length, visits.length).isPositive
                      ? "text-green-600"
                      : "text-amber-600"
                  }`}
                >
                  {getChangePercentage(visits.length, visits.length)
                    .isPositive ? (
                    <FaArrowUp className="mr-1" />
                  ) : (
                    <FaArrowDown className="mr-1" />
                  )}
                  100% of traffic
                </span>
              </div>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg z-10">
              <FaGlobe className="text-indigo-600 text-2xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-100 rounded-full -mt-10 -mr-10 opacity-50"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Unique Visitors
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1 flex items-end">
                {uniqueVisitors}
                <span className="text-sm ml-2 font-normal text-gray-500">
                  visitors
                </span>
              </h3>

              <div className="mt-3 inline-flex items-center text-xs font-medium">
                {uniqueVisitors > 0 && (
                  <span className="flex items-center text-emerald-600">
                    <FaUserFriends className="mr-1" />
                    {((uniqueVisitors / visits.length) * 100).toFixed(1)}%
                    engagement rate
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg z-10">
              <FaUserShield className="text-emerald-600 text-2xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-amber-100 rounded-full -mt-10 -mr-10 opacity-50"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Mobile Users
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1 flex items-end">
                {deviceStats.find((d) => d.name === "mobile")?.value || 0}
                <span className="text-sm ml-2 font-normal text-gray-500">
                  users
                </span>
              </h3>

              <div className="mt-3 inline-flex items-center text-xs font-medium">
                {visits.length > 0 && (
                  <span className="flex items-center text-amber-600">
                    <FaInfoCircle className="mr-1" />
                    {(
                      ((deviceStats.find((d) => d.name === "mobile")?.value ||
                        0) /
                        visits.length) *
                      100
                    ).toFixed(1)}
                    % of total traffic
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg z-10">
              <FaMobile className="text-amber-600 text-2xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.4)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-100 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-purple-100 rounded-full -mt-10 -mr-10 opacity-50"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Desktop Users
              </p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1 flex items-end">
                {deviceStats.find((d) => d.name === "desktop")?.value || 0}
                <span className="text-sm ml-2 font-normal text-gray-500">
                  users
                </span>
              </h3>

              <div className="mt-3 inline-flex items-center text-xs font-medium">
                {visits.length > 0 && (
                  <span className="flex items-center text-purple-600">
                    <FaInfoCircle className="mr-1" />
                    {(
                      ((deviceStats.find((d) => d.name === "desktop")?.value ||
                        0) /
                        visits.length) *
                      100
                    ).toFixed(1)}
                    % of total traffic
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg z-10">
              <FaDesktop className="text-purple-600 text-2xl" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab navigation for main charts */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
          >
            <FaChartArea className="mr-2" /> Traffic Overview
          </button>
          <button
            onClick={() => setActiveTab("devices")}
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === "devices"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
          >
            <FaChartPie className="mr-2" /> Device Analysis
          </button>
          <button
            onClick={() => setActiveTab("pages")}
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === "pages"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
          >
            <FaMapMarkerAlt className="mr-2" /> Top Pages
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === "raw"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
          >
            <FaTable className="mr-2" /> Raw Data
          </button>
          {/* Referrer filter dropdown */}
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium">
              Referrer:
            </label>
            <select
              value={referrerFilter}
              onChange={(e) => setReferrerFilter(e.target.value)}
              className="px-2 py-1 rounded border border-gray-300 text-sm text-gray-700"
            >
              <option value="">All</option>
              <option value="direct">Direct</option>
              {referrerStats.map((r) =>
                r.name !== "direct" && r.name !== "" ? (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ) : null
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Main content area based on active tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "overview" && (
            <>
              {/* Enhanced Daily Visitor Chart */}
              <div className="mb-8">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <FaChartLine className="text-indigo-600 mr-2" />
                      Daily Visitor Trend
                    </h3>
                    <p className="text-gray-500 mt-1">Visitor flow over time</p>
                  </div>
                  <div className="p-6">
                    {dailyVisits.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart
                          data={dailyVisits}
                          margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorVisits"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#4F46E5"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#4F46E5"
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip
                            formatter={(value) => [
                              `${value} visits`,
                              "Page Views",
                            ]}
                            labelFormatter={(label) =>
                              `Date: ${new Date(label).toLocaleDateString()}`
                            }
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              borderRadius: "8px",
                              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                              border: "none",
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="visits"
                            stroke="#4F46E5"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorVisits)"
                            name="Page Views"
                            activeDot={{
                              r: 8,
                              strokeWidth: 2,
                              stroke: "#ffffff",
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                        <FaChartLine className="text-4xl text-gray-300 mb-3 mx-auto" />
                        <p className="font-medium">
                          No daily visit data available for the selected period
                        </p>
                        <p className="text-sm mt-2">
                          Try selecting a different date range
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Traffic Sources Chart */}
              <div className="mb-8">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <FaGlobe className="text-indigo-600 mr-2" />
                      Traffic Sources
                    </h3>
                    <p className="text-gray-500 mt-1">
                      Where your visitors come from
                    </p>
                  </div>
                  <div className="p-6">
                    {referrerStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                          data={referrerStats.slice(0, 8)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          barCategoryGap="20%"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{
                              fontSize: 12,
                              angle: -45,
                              textAnchor: "end",
                            }}
                            height={70}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip
                            formatter={(value, name) => [
                              `${value} visits`,
                              "Referrals",
                            ]}
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              borderRadius: "8px",
                              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                              border: "none",
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="value"
                            name="Visits"
                            fill="#4F46E5"
                            radius={[4, 4, 0, 0]}
                          >
                            {referrerStats.slice(0, 8).map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                        <FaGlobe className="text-4xl text-gray-300 mb-3 mx-auto" />
                        <p className="font-medium">
                          No referrer data available for the selected period
                        </p>
                        <p className="text-sm mt-2">
                          Try selecting a different date range
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "devices" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Device Distribution */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaChartPie className="text-indigo-600 mr-2" />
                    Device Distribution
                  </h3>
                  <p className="text-gray-500 mt-1">Mobile vs Desktop usage</p>
                </div>
                <div className="p-6">
                  {deviceStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={deviceStats}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          innerRadius={50}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {deviceStats.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              strokeWidth={2}
                              stroke="#ffffff"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} visits (${(
                              (value / visits.length) *
                              100
                            ).toFixed(1)}%)`,
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                            border: "none",
                          }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          formatter={(value) => (
                            <span className="text-gray-800 font-medium">
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                      <FaMobile className="text-4xl text-gray-300 mb-3 mx-auto" />
                      <p className="font-medium">No device data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Browsers */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaGlobe className="text-indigo-600 mr-2" />
                    Top Browsers
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Browser preferences of your visitors
                  </p>
                </div>
                <div className="p-6">
                  {browserStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={browserStats.slice(0, 5)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          innerRadius={50}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {browserStats.slice(0, 5).map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              strokeWidth={2}
                              stroke="#ffffff"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} visits (${(
                              (value / visits.length) *
                              100
                            ).toFixed(1)}%)`,
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                            border: "none",
                          }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          formatter={(value) => (
                            <span className="text-gray-800 font-medium">
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                      <FaGlobe className="text-4xl text-gray-300 mb-3 mx-auto" />
                      <p className="font-medium">No browser data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Operating Systems */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaGlobe className="text-indigo-600 mr-2" />
                    Top Operating Systems
                  </h3>
                  <p className="text-gray-500 mt-1">
                    OS distribution among visitors
                  </p>
                </div>
                <div className="p-6">
                  {osStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={osStats.slice(0, 5)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          innerRadius={50}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {osStats.slice(0, 5).map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              strokeWidth={2}
                              stroke="#ffffff"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} visits (${(
                              (value / visits.length) *
                              100
                            ).toFixed(1)}%)`,
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                            border: "none",
                          }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          formatter={(value) => (
                            <span className="text-gray-800 font-medium">
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                      <FaGlobe className="text-4xl text-gray-300 mb-3 mx-auto" />
                      <p className="font-medium">No OS data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "pages" && (
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaMapMarkerAlt className="text-indigo-600 mr-2" />
                    Top Pages
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Most visited pages on your website
                  </p>
                </div>
                <div className="p-6">
                  {pageViewsByPath.length > 0 ? (
                    <ResponsiveContainer width="100%" height={500}>
                      <BarChart
                        data={pageViewsByPath.slice(0, 10)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" />
                        <YAxis
                          dataKey="path"
                          type="category"
                          width={150}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `${value} page views`,
                            "Visits",
                          ]}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                            border: "none",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="count"
                          name="Page Views"
                          fill="#4F46E5"
                          radius={[0, 4, 4, 0]}
                          barSize={30}
                        >
                          {pageViewsByPath.slice(0, 10).map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                      <FaMapMarkerAlt className="text-4xl text-gray-300 mb-3 mx-auto" />
                      <p className="font-medium">No page data available</p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Page Analysis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pageViewsByPath.slice(0, 6).map((page, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                      >
                        <div className="flex justify-between items-start">
                          <div className="truncate flex-1">
                            <div className="text-xs text-gray-500 mb-1">
                              Path
                            </div>
                            <div className="font-medium text-gray-800 truncate">
                              {page.path}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-xs text-gray-500 mb-1">
                              Views
                            </div>
                            <div className="font-medium text-indigo-600">
                              {page.count}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="text-xs text-gray-500">
                            Traffic Share
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                              <div
                                style={{
                                  width: `${(
                                    (page.count / visits.length) *
                                    100
                                  ).toFixed(1)}%`,
                                }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                              ></div>
                            </div>
                            <div className="text-xs mt-1 text-right">
                              {((page.count / visits.length) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "raw" && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <FaTable className="text-indigo-600 mr-2" />
                    Raw Visit Data
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Showing{" "}
                    {isTableExpanded
                      ? visits.length
                      : Math.min(visits.length, 10)}{" "}
                    of {visits.length} visit records
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filter records..."
                      className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-9"
                    />
                    <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                  <button
                    onClick={() => setIsTableExpanded(!isTableExpanded)}
                    className="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    {isTableExpanded ? "Show Less" : "Show All"}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Time
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Page
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Device
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Browser
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        OS
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Referrer
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVisits
                      .slice(0, isTableExpanded ? undefined : 10)
                      .map((visit, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                            {visit.timestamp.toLocaleString()}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {visit.pathname}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                visit.deviceType === "mobile"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-indigo-100 text-indigo-800"
                              }`}
                            >
                              {visit.deviceType === "mobile" ? (
                                <FaMobile className="mr-1" />
                              ) : (
                                <FaDesktop className="mr-1" />
                              )}
                              {visit.deviceType}
                            </span>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                            {visit.browser} {visit.browserVersion}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                            {visit.os} {visit.osVersion}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                            {visit.referrer || "direct"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Total records: {visits.length}
                  </p>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <FaDownload className="mr-2" /> Download all data as Excel
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating success message for export */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 right-5 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center"
          >
            <FaDownload className="mr-2" />
            Export successful! File downloaded.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TrafficDashboard;
