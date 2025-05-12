import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

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

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎓 Leaderboards</h1>

      <div style={{ marginBottom: "2rem" }}>
        <h2>
          📋 Your Batch Leaderboard - {studentClass} | {studentBatch}
        </h2>
        {studentRank && (
          <p style={{ fontWeight: "bold", color: "#3a6df0" }}>
            Your Rank: #{studentRank}
          </p>
        )}
        <table
          border="1"
          cellPadding="8"
          cellSpacing="0"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th>Rank</th>
              <th>Name</th>
              <th>Total Marks</th>
              <th>Out Of</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {studentViewData.map((s, index) => {
              const isCurrentUser = s.name === studentName;
              return (
                <tr
                  key={s.name + index}
                  style={{
                    backgroundColor: isCurrentUser ? "#e0f7fa" : "white",
                    fontWeight: isCurrentUser ? "bold" : "normal",
                  }}
                >
                  <td>{index + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.totalMarks}</td>
                  <td>{s.totalOutOf}</td>
                  <td>{s.percentage}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {classOrder.map((className) => {
        const classData = leaderboards[className];
        if (!classData) return null;

        const availableBatches = Object.keys(classData);
        const selectedBatch = selectedBatches[className];
        const filter = filterMode[className] || "all";

        return (
          <div key={className} style={{ marginBottom: "3rem" }}>
            <h2 style={{ color: "#3a6df0" }}>{className}</h2>

            <label>
              <strong>Choose Batch:</strong>{" "}
              <select
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
            </label>

            <div style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>
              <strong>Filter:</strong>
              <label style={{ marginLeft: "1rem" }}>
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
                />{" "}
                All Students
              </label>
              <label style={{ marginLeft: "1rem" }}>
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
                />{" "}
                Top 3 Only
              </label>
            </div>

            {selectedBatch && classData[selectedBatch] && (
              <table
                border="1"
                cellPadding="8"
                cellSpacing="0"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f0f0f0" }}>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Total Marks</th>
                    <th>Out Of</th>
                    <th>Percentage</th>
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

                    return (
                      <tr
                        key={s.name + index}
                        style={{
                          backgroundColor:
                            index === 0
                              ? "#fff9e6"
                              : index === 1
                              ? "#f0f7ff"
                              : index === 2
                              ? "#fdf2f8"
                              : "white",
                          fontWeight: index < 3 ? "bold" : "normal",
                        }}
                      >
                        <td>{medal}</td>
                        <td>{s.name}</td>
                        <td>{s.totalMarks}</td>
                        <td>{s.totalOutOf}</td>
                        <td>{s.percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Leaderboard;
