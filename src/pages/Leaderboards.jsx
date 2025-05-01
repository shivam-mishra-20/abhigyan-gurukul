import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const Leaderboards = () => {
  const className = localStorage.getItem("studentClass") || "";
  const batch = localStorage.getItem("studentBatch") || "";
  const currentName = localStorage.getItem("studentName") || "";

  const [rankings, setRankings] = useState([]);
  const [yourRank, setYourRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllRankings, setShowAllRankings] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // Only fetch if we have valid className and batch
        if (!className || !batch) {
          setRankings([]);
          setYourRank("N/A");
          return;
        }

        const q = query(
          collection(db, "Results"),
          where("class", "==", className)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filtered = data.filter((res) => res.batch === batch);

        const scoreMap = {};

        for (const res of filtered) {
          const name = res.name;
          // Add better type coercion and validation
          const marks = Number(res.marks) || 0;
          const outOf = Number(res.outOf) || 0;
          if (!scoreMap[name]) scoreMap[name] = { total: 0, totalOutOf: 0 };
          scoreMap[name].total += marks;
          scoreMap[name].totalOutOf += outOf;
        }

        const leaderboard = Object.entries(scoreMap)
          .map(([name, { total, totalOutOf }]) => ({
            name,
            percentage:
              totalOutOf > 0 ? ((total / totalOutOf) * 100).toFixed(2) : "0.00",
          }))
          .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

        setRankings(leaderboard);

        const yourIndex = leaderboard.findIndex((x) => x.name === currentName);
        setYourRank(yourIndex !== -1 ? yourIndex + 1 : "N/A");
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setRankings([]);
        setYourRank("N/A");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [className, batch, currentName]);

  const getMedal = (i) => ["🥇", "🥈", "🥉"][i];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8 max-w-6xl mx-auto my-8"
    >
      <div className="bg-white shadow-2xl rounded-2xl p-8">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl mb-8">
          <h2 className="text-center text-gray-600 text-sm font-medium uppercase tracking-wider mb-2">
            {className} — {batch} Batch
          </h2>
          <h1 className="text-4xl font-bold text-center text-green-700 flex justify-center items-center gap-3">
            🏆 Leaderboards
          </h1>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-end gap-8 md:gap-16 mb-12">
          {[1, 0, 2].map((pos, i) =>
            rankings[pos] ? (
              <motion.div
                key={pos}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className={`relative flex items-center justify-center text-center rounded-full shadow-lg font-semibold transition-all duration-300 border-4 ${
                    pos === 0
                      ? "w-40 h-40 bg-gradient-to-br from-yellow-300 to-yellow-400 border-yellow-500 text-lg"
                      : pos === 1
                      ? "w-36 h-36 bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400 text-base"
                      : "w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-300 border-orange-400 text-sm"
                  }`}
                >
                  <span className="absolute -top-2 -left-2 text-2xl animate-bounce">
                    {getMedal(pos)}
                  </span>
                  <div className="px-2">
                    {rankings[pos].name.split(" ").map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                    <div className="text-sm mt-1 font-normal">
                      {rankings[pos].percentage}%
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 text-sm font-medium">
                  {pos + 1}
                  {pos === 0 ? "st" : pos === 1 ? "nd" : "rd"} Place
                </p>
              </motion.div>
            ) : null
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center p-4 bg-green-50 rounded-xl mb-8"
        >
          <div className="text-lg font-medium text-gray-700">
            Your Current Position:{" "}
            <span className="font-bold text-green-700 text-2xl ml-2">
              {yourRank}
              {typeof yourRank === "number" &&
                (yourRank === 1
                  ? "st"
                  : yourRank === 2
                  ? "nd"
                  : yourRank === 3
                  ? "rd"
                  : "th")}
            </span>
          </div>
        </motion.div>

        <div className="text-center">
          <button
            onClick={() => setShowAllRankings(!showAllRankings)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {showAllRankings ? "Hide" : "Show"} All Rankings
          </button>
        </div>

        <AnimatePresence>
          {showAllRankings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 overflow-hidden"
            >
              <div className="bg-gray-50 rounded-xl p-4">
                {rankings.map((student, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex justify-between items-center p-3 rounded-lg mb-2 ${
                      student.name === currentName
                        ? "bg-green-100 border-2 border-green-300"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-600 w-8">
                        #{index + 1}
                      </span>
                      <span className="font-semibold">{student.name}</span>
                    </div>
                    <span className="font-medium text-green-700">
                      {student.percentage}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Leaderboards;
