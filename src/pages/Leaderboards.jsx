import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import {
  FaTrophy,
  FaMedal,
  FaStar,
  FaSort,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaFilter,
} from "react-icons/fa";
import { BsPersonCheckFill } from "react-icons/bs";
import { GiPodium } from "react-icons/gi";

const Leaderboard = () => {
  const [leaderboards, setLeaderboards] = useState({});
  const [selectedBatches, setSelectedBatches] = useState({});
  const [filterMode, setFilterMode] = useState({});
  const [studentViewData, setStudentViewData] = useState([]);
  const [studentRank, setStudentRank] = useState(null);

  const classOrder = ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
  const batchOrder = ["Aadharshila", "Lakshya", "Basic"];

  const studentClass = localStorage.getItem("studentClass");
  const studentBatch = localStorage.getItem("studentBatch");
  const studentName = localStorage.getItem("studentName");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const colRef = collection(db, "ActualStudentResults");
      const snapshot = await getDocs(colRef);

      const tempMap = {};
      const studentFiltered = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const results = data.results || [];

        const totalMarks = results.reduce(
          (sum, r) => sum + parseFloat(r.marks || "0"),
          0
        );
        const totalOutOf = results.reduce(
          (sum, r) => sum + parseFloat(r.outOf || "0"),
          0
        );
        const percentage = totalOutOf > 0 ? (totalMarks / totalOutOf) * 100 : 0;

        const entry = {
          name: data.name,
          class: data.class,
          batch: data.batch,
          totalMarks,
          totalOutOf,
          percentage: percentage.toFixed(2),
        };

        if (!tempMap[data.class]) tempMap[data.class] = {};
        if (!tempMap[data.class][data.batch])
          tempMap[data.class][data.batch] = [];
        tempMap[data.class][data.batch].push(entry);

        if (data.class === studentClass && data.batch === studentBatch) {
          studentFiltered.push(entry);
        }
      });

      Object.keys(tempMap).forEach((classKey) => {
        Object.keys(tempMap[classKey]).forEach((batchKey) => {
          tempMap[classKey][batchKey].sort(
            (a, b) => b.percentage - a.percentage
          );
        });
      });

      studentFiltered.sort((a, b) => b.percentage - a.percentage);
      const rank = studentFiltered.findIndex((s) => s.name === studentName);
      if (rank !== -1) setStudentRank(rank + 1);
      setStudentViewData(studentFiltered);

      const defaultBatches = {};
      const defaultFilters = {};
      classOrder.forEach((cls) => {
        if (tempMap[cls]) {
          const availableBatches = Object.keys(tempMap[cls]);
          const selected =
            batchOrder.find((b) => availableBatches.includes(b)) ||
            availableBatches[0];
          if (selected) {
            defaultBatches[cls] = selected;
            defaultFilters[cls] = "all";
          }
        }
      });

      setLeaderboards(tempMap);
      setSelectedBatches(defaultBatches);
      setFilterMode(defaultFilters);
    };

    fetchLeaderboard();
  }, []);

  const tableHeaderStyle = {
    backgroundColor: "#2c3e50",
    color: "white",
    padding: "12px",
    textAlign: "left",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    marginBottom: "30px",
  };

  const buttonStyle = {
    border: "none",
    borderRadius: "4px",
    padding: "8px 15px",
    margin: "0 5px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  };

  const selectStyle = {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    marginLeft: "10px",
    fontWeight: "bold",
  };

  const filterContainerStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
    flexWrap: "wrap",
    gap: "10px",
  };

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      }}
    >
      <h1
        style={{
          color: "#2c3e50",
          borderBottom: "2px solid #3498db",
          paddingBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <FaTrophy style={{ color: "#f1c40f" }} /> Leaderboards
      </h1>

      <div style={cardStyle}>
        <h2
          style={{
            color: "#3a6df0",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <BsPersonCheckFill /> Your Batch Leaderboard - {studentClass} |{" "}
          {studentBatch}
        </h2>

        {studentRank && (
          <div
            style={{
              fontWeight: "bold",
              color: "#fff",
              backgroundColor: "#3a6df0",
              padding: "10px 15px",
              borderRadius: "5px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "15px",
            }}
          >
            <FaStar /> Your Rank: #{studentRank}
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}
          >
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Rank</th>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Total Marks</th>
                <th style={tableHeaderStyle}>Out Of</th>
                <th style={tableHeaderStyle}>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {studentViewData.map((s, index) => {
                const isCurrentUser = s.name === studentName;
                return (
                  <tr
                    key={s.name + index}
                    style={{
                      backgroundColor: isCurrentUser
                        ? "#e3f2fd"
                        : index % 2 === 0
                        ? "#f8f9fa"
                        : "white",
                      fontWeight: isCurrentUser ? "bold" : "normal",
                      borderLeft: isCurrentUser ? "4px solid #3a6df0" : "none",
                    }}
                  >
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {index < 3 ? (
                        <span style={{ fontSize: "20px" }}>
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                        </span>
                      ) : (
                        <span style={{ fontWeight: "bold" }}>{index + 1}</span>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {isCurrentUser ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <FaUserGraduate color="#3a6df0" /> {s.name}
                        </span>
                      ) : (
                        s.name
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>{s.totalMarks}</td>
                    <td style={{ padding: "12px" }}>{s.totalOutOf}</td>
                    <td
                      style={{
                        padding: "12px",
                        color:
                          parseFloat(s.percentage) > 90
                            ? "#2ecc71"
                            : parseFloat(s.percentage) > 75
                            ? "#3498db"
                            : parseFloat(s.percentage) > 60
                            ? "#f39c12"
                            : "#e74c3c",
                        fontWeight: "bold",
                      }}
                    >
                      {s.percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {classOrder.map((className) => {
        const classData = leaderboards[className];
        if (!classData) return null;

        const availableBatches = Object.keys(classData);
        const selectedBatch = selectedBatches[className];
        const filter = filterMode[className] || "all";

        return (
          <div key={className} style={cardStyle}>
            <h2
              style={{
                color: "#2c3e50",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
                borderBottom: "2px solid #f1c40f",
                paddingBottom: "10px",
              }}
            >
              <FaChalkboardTeacher /> {className}
            </h2>

            <div style={filterContainerStyle}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontWeight: "bold" }}>Choose Batch:</span>
                <select
                  style={selectStyle}
                  value={selectedBatch}
                  onChange={(e) =>
                    setSelectedBatches((prev) => ({
                      ...prev,
                      [className]: e.target.value,
                    }))
                  }
                >
                  {batchOrder
                    .filter((batch) => availableBatches.includes(batch))
                    .map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#f5f5f5",
                  borderRadius: "8px",
                  padding: "8px 15px",
                  gap: "10px",
                }}
              >
                <FaFilter style={{ color: "#3a6df0" }} />
                <span style={{ fontWeight: "bold" }}>Filter:</span>
                <label
                  style={{
                    marginLeft: "10px",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name={`filter-${className}`}
                    value="all"
                    checked={filter === "all"}
                    onChange={() =>
                      setFilterMode((prev) => ({
                        ...prev,
                        [className]: "all",
                      }))
                    }
                    style={{ marginRight: "5px" }}
                  />
                  All Students
                </label>
                <label
                  style={{
                    marginLeft: "15px",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name={`filter-${className}`}
                    value="top3"
                    checked={filter === "top3"}
                    onChange={() =>
                      setFilterMode((prev) => ({
                        ...prev,
                        [className]: "top3",
                      }))
                    }
                    style={{ marginRight: "5px" }}
                  />
                  <GiPodium style={{ marginRight: "5px", color: "#f1c40f" }} />
                  Top 3 Only
                </label>
              </div>
            </div>

            {selectedBatch && classData[selectedBatch] && (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "left",
                            gap: "5px",
                          }}
                        >
                          <FaMedal /> Rank
                        </span>
                      </th>
                      <th style={tableHeaderStyle}>Name</th>
                      <th style={tableHeaderStyle}>Total Marks</th>
                      <th style={tableHeaderStyle}>Out Of</th>
                      <th style={tableHeaderStyle}>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "left",
                            gap: "5px",
                          }}
                        >
                          <FaSort /> Percentage
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filter === "top3"
                      ? classData[selectedBatch].slice(0, 3)
                      : classData[selectedBatch]
                    ).map((s, index) => {
                      let medal = index + 1;
                      if (index === 0) medal = "🥇";
                      else if (index === 1) medal = "🥈";
                      else if (index === 2) medal = "🥉";

                      const rankColors = {
                        0: "#fef3c7", // Gold
                        1: "#e5e7eb", // Silver
                        2: "#fef2f2", // Bronze
                      };

                      return (
                        <tr
                          key={s.name + index}
                          style={{
                            backgroundColor:
                              index < 3
                                ? rankColors[index]
                                : index % 2 === 0
                                ? "#f8f9fa"
                                : "white",
                            fontWeight: index < 3 ? "bold" : "normal",
                          }}
                        >
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span style={{ fontSize: "20px" }}>{medal}</span>
                          </td>
                          <td style={{ padding: "12px" }}>{s.name}</td>
                          <td style={{ padding: "12px" }}>{s.totalMarks}</td>
                          <td style={{ padding: "12px" }}>{s.totalOutOf}</td>
                          <td
                            style={{
                              padding: "12px",
                              color:
                                parseFloat(s.percentage) > 90
                                  ? "#2ecc71"
                                  : parseFloat(s.percentage) > 75
                                  ? "#3498db"
                                  : parseFloat(s.percentage) > 60
                                  ? "#f39c12"
                                  : "#e74c3c",
                              fontWeight: "bold",
                            }}
                          >
                            {s.percentage}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Leaderboard;
