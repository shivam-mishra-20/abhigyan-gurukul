import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { motion } from "framer-motion";

const MiniLeaderboardCard = ({ limit = 5 }) => {
  const [topStudents, setTopStudents] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchTopStudents = async () => {
      const snapshot = await getDocs(collection(db, "ActualStudentResults"));
      const filtered = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.class === "Class 10" && data.batch === "Lakshya") {
          const results = data.results || [];
          const totalMarks = results.reduce(
            (sum, r) => sum + parseFloat(r.marks || "0"),
            0
          );
          const totalOutOf = results.reduce(
            (sum, r) => sum + parseFloat(r.outOf || "0"),
            0
          );
          const percentage =
            totalOutOf > 0 ? (totalMarks / totalOutOf) * 100 : 0;

          filtered.push({
            name: data.name,
            percentage: percentage.toFixed(2),
            totalMarks,
            totalOutOf,
          });
        }
      });

      filtered.sort((a, b) => b.percentage - a.percentage);
      setTopStudents(filtered.slice(0, limit));
    };

    fetchTopStudents();
  }, [limit]);

  return (
    <>
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            padding: "10px 16px",
            backgroundColor: "#3a6df0",
            color: "#fff",
            border: "none",
            borderRadius: "20px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          Show Leaderboard
        </button>
      )}

      {isVisible && (
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
          dragElastic={0.2}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            backgroundColor: "#ffffff",
            border: "1px solid #ccc",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: "320px",
            zIndex: 1000,
            cursor: isDragging ? "grabbing" : "grab",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#3a6df0" }}>
              🎉 Podium - Class 10 Lakshya
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
          {topStudents.length >= 3 ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "flex-end",
                height: 140,
              }}
            >
              <motion.div
                style={{ textAlign: "center" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div
                  title={`Marks: ${topStudents[1].totalMarks}/${topStudents[1].totalOutOf}`}
                  style={{
                    height: 60,
                    backgroundColor: "#d4d4d4",
                    padding: 6,
                    borderRadius: 8,
                    transition: "all 0.3s",
                  }}
                >
                  🥈
                  <br />
                  <small>{topStudents[1].name}</small>
                  <br />
                  <small>{topStudents[1].percentage}%</small>
                </div>
              </motion.div>

              <motion.div
                style={{ textAlign: "center" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div
                  title={`Marks: ${topStudents[0].totalMarks}/${topStudents[0].totalOutOf}`}
                  style={{
                    height: 90,
                    backgroundColor: "#ffd700",
                    padding: 6,
                    borderRadius: 8,
                    transition: "all 0.3s",
                  }}
                >
                  🥇
                  <br />
                  <strong>{topStudents[0].name}</strong>
                  <br />
                  <small>{topStudents[0].percentage}%</small>
                </div>
              </motion.div>

              <motion.div
                style={{ textAlign: "center" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div
                  title={`Marks: ${topStudents[2].totalMarks}/${topStudents[2].totalOutOf}`}
                  style={{
                    height: 50,
                    backgroundColor: "#cd7f32",
                    padding: 6,
                    borderRadius: 8,
                    transition: "all 0.3s",
                  }}
                >
                  🥉
                  <br />
                  <small>{topStudents[2].name}</small>
                  <br />
                  <small>{topStudents[2].percentage}%</small>
                </div>
              </motion.div>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </motion.div>
      )}
    </>
  );
};

export default MiniLeaderboardCard;
