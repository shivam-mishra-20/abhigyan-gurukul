import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, getDocs } from "firebase/firestore";

const days = ["Class 7", "Class 8th Lakshya", "Class 8th Aadharshila"];
const periods = [
  "Period 1",
  "Period 2",
  "Period 3",
  "Period 4",
  "Period 5",
  "Period 6",
];
const rowHeaders = [
  "Class 7th",
  "Class 8th Lakshya",
  "Class 8th Aadharshila",
  "Class 9th Lakshya",
  "Class 9th Aadharshila",
  "Class 10th Lakshya",
  "Class 10th Aadharshila",
  "Class 10th Basic",
  "Class 11th Science",
  "Class 11th Commerce",
  "Class 12th BIO",
  "Class 12th MATHS",
  "Class 12th Commerce",
  "Keshav 11th",
];

const TimeTable = () => {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTimetable = async () => {
    setLoading(true);
    const q = query(collection(db, "TimeTable"));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      // Find the latest timetable with all required rowHeaders
      let latest = null;
      for (let i = snapshot.docs.length - 1; i >= 0; i--) {
        const data = snapshot.docs[i].data();
        if (
          data.timetable &&
          Object.keys(data.timetable).length === rowHeaders.length
        ) {
          latest = data;
          break;
        }
      }
      if (!latest) latest = snapshot.docs[snapshot.docs.length - 1].data();
      setTimetable(latest.timetable);
      if (latest.periods) {
        periods.splice(0, periods.length, ...latest.periods);
      }
    } else {
      setTimetable(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTimetable();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Time Table for {new Date().toLocaleDateString()}
      </h2>
      <div className="flex gap-4 mb-6">
        {/* Class and Batch selection removed as timetable is now global */}
      </div>
      {loading ? (
        <div>Loading timetable...</div>
      ) : timetable ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-xs">
            <thead>
              <tr>
                <th className="border px-2 py-1 bg-green-100 sticky top-0">
                  Class / Period
                </th>
                {periods.map((period) => (
                  <th
                    key={period}
                    className="border px-2 py-1 bg-green-100 sticky top-0"
                  >
                    {period}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowHeaders.map((row) => (
                <tr key={row}>
                  <td className="border px-2 py-1 font-semibold bg-green-50 sticky left-0">
                    {row}
                  </td>
                  {periods.map((_, idx) => (
                    <td
                      key={idx}
                      className="border px-2 py-1"
                      style={{ width: 90, height: 60 }}
                    >
                      {timetable &&
                      timetable[row] &&
                      timetable[row][idx] &&
                      timetable[row][idx].subject ? (
                        <>
                          <div className="font-semibold text-green-800">
                            {timetable[row][idx].subject}
                          </div>
                          <div className="text-xs text-gray-500">
                            Teacher: {timetable[row][idx].teacher || "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Room: {timetable[row][idx].room || "-"}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-400">
          No timetable found for this class and batch.
        </div>
      )}
    </div>
  );
};

export default TimeTable;
