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
  // Add: Store user pictures by name
  const [userPics, setUserPics] = useState({});

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
            // Default to "top3" instead of "all"
            defaultFilters[cls] = "top3";
          }
        }
      });

      setLeaderboards(tempMap);
      setSelectedBatches(defaultBatches);
      setFilterMode(defaultFilters);
    };

    // Fetch user profile pictures
    const fetchUserPics = async () => {
      const usersSnap = await getDocs(collection(db, "Users"));
      const pics = {};
      usersSnap.forEach((doc) => {
        const data = doc.data();
        if (data.name && data.profilePicUrl) {
          pics[data.name] = data.profilePicUrl;
        }
      });
      setUserPics(pics);
    };

    fetchLeaderboard();
    fetchUserPics();
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

  // Podium component for top 3
  const Podium = ({ top3, userPics, studentName }) => {
    // Arrange: 2nd, 1st, 3rd (left, center, right)
    const order = [1, 0, 2];
    const heights = [90, 130, 75]; // px
    const bgColors = [
      "linear-gradient(135deg, #e0e7ef 0%, #bfc9d1 100%)",
      "linear-gradient(135deg, #fffbe6 0%, #ffe066 100%)",
      "linear-gradient(135deg, #f7e6d1 0%, #e5b07b 100%)",
    ];
    const shadowColors = [
      "0 4px 12px rgba(191,201,209,0.18)",
      "0 8px 24px rgba(255,224,102,0.22)",
      "0 4px 12px rgba(229,176,123,0.18)",
    ];
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 36,
          marginBottom: 40,
          marginTop: 24,
          minHeight: 170,
          position: "relative",
        }}
      >
        {/* Decorative subtle background */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(circle at 50% 60%, rgba(58,109,240,0.06) 0%, transparent 80%)",
            zIndex: 0,
          }}
        />
        {order.map((idx, i) => {
          const s = top3[idx];
          if (!s) return <div key={i} style={{ width: 100 }} />;
          const isCurrentUser = s.name === studentName;
          const hasPic = !!userPics[s.name];
          return (
            <div
              key={s.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 110,
                zIndex: 1,
                transition: "transform 0.25s cubic-bezier(.4,2,.6,1)",
                transform: isCurrentUser ? "scale(1.04)" : "scale(1)",
              }}
            >
              <div
                style={{
                  background: bgColors[i],
                  height: heights[i],
                  width: 70,
                  borderRadius: 18,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  boxShadow: shadowColors[i],
                  border: isCurrentUser
                    ? "3px solid #3a6df0"
                    : "1.5px solid #e5e7eb",
                  position: "relative",
                  transition: "box-shadow 0.3s, border 0.3s",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -38,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 2,
                  }}
                >
                  {hasPic ? (
                    <img
                      src={userPics[s.name]}
                      alt={s.name}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `3px solid ${
                          isCurrentUser ? "#3a6df0" : "#fff"
                        }`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                        background: "#fff",
                        transition: "transform 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.13)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    />
                  ) : (
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
                        color: "#3a6df0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: 26,
                        border: `3px solid ${
                          isCurrentUser ? "#3a6df0" : "#fff"
                        }`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                        transition: "transform 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.13)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      {s.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    marginBottom: 12,
                    fontSize: 28,
                    filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.13))",
                    marginTop: heights[i] - 56 - 24,
                  }}
                >
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                </div>
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontWeight: isCurrentUser ? "bold" : "normal",
                  color: isCurrentUser ? "#3a6df0" : "#222",
                  fontSize: 14,
                  textAlign: "center",
                  maxWidth: 80,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {s.name}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#666",
                  fontWeight: "bold",
                  marginTop: 2,
                }}
              >
                {s.percentage}%
              </div>
            </div>
          );
        })}
      </div>
    );
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

        {/* Podium for Your Batch Leaderboard */}
        {studentViewData.length > 0 && (
          <Podium
            top3={studentViewData.slice(0, 3)}
            userPics={userPics}
            studentName={studentName}
          />
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
                    <td
                      style={{
                        padding: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {/* Show profile picture if available */}
                      {userPics[s.name] ? (
                        <img
                          src={userPics[s.name]}
                          alt={s.name}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #3a6df0",
                            marginRight: 6,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#e5e7eb",
                            color: "#3a6df0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginRight: 6,
                          }}
                        >
                          {s.name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
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

            {/* Podium for each class/batch leaderboard */}
            {selectedBatch &&
              classData[selectedBatch] &&
              classData[selectedBatch].length > 0 && (
                <Podium
                  top3={classData[selectedBatch].slice(0, 3)}
                  userPics={userPics}
                  studentName={studentName}
                />
              )}

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
                          <td
                            style={{
                              padding: "12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {/* Show profile picture if available */}
                            {userPics[s.name] ? (
                              <img
                                src={userPics[s.name]}
                                alt={s.name}
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "2px solid #3a6df0",
                                  marginRight: 6,
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background: "#e5e7eb",
                                  color: "#3a6df0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "bold",
                                  fontSize: 16,
                                  marginRight: 6,
                                }}
                              >
                                {s.name?.[0]?.toUpperCase() || "?"}
                              </div>
                            )}
                            {s.name}
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
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Leaderboard;
