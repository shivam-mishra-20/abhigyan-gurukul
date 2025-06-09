import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, setDoc, doc, getDoc } from "firebase/firestore";

const periods = [
  "3:30 - 4:30PM",
  "4:30 - 5:30PM",
  "5:30 - 6:30PM",
  "6:30 - 7:30PM",
  "7:30 - 8:30PM",
  "8:30 - 9:30PM",
];
const subjects = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "English",
  "Biology",
  "Language",
  "Social Science",
];
const teachers = ["Teacher A", "Teacher B", "Teacher C", "Teacher D"];
const classes = ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
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

const TimeTableManager = () => {
  const [timetable, setTimetable] = useState(() => {
    const obj = {};
    rowHeaders.forEach((row) => {
      obj[row] = periods.map(() => ({
        subject: "",
        teacher: "",
        room: "",
      }));
    });
    return obj;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingCell, setEditingCell] = useState({
    row: null,
    periodIdx: null,
  });

  useEffect(() => {
    // On mount, fetch today's timetable and set it in state
    const fetchTodayTimetable = async () => {
      const now = new Date();
      const day = now.toLocaleDateString("en-US", { weekday: "long" });
      const date = now.toLocaleDateString("en-CA"); // YYYY-MM-DD
      const docId = `${day}_${date}`;
      const docRef = doc(db, "TimeTable", docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTimetable(data.timetable);
      }
    };
    fetchTodayTimetable();
  }, []);

  const handleCellChange = (day, periodIdx, field, value) => {
    setTimetable((prev) => {
      const updated = { ...prev };
      updated[day] = [...updated[day]];
      updated[day][periodIdx] = { ...updated[day][periodIdx], [field]: value };
      return updated;
    });
  };

  const getDocId = () => {
    const now = new Date();
    const day = now.toLocaleDateString("en-US", { weekday: "long" });
    const date = now.toLocaleDateString("en-CA"); // YYYY-MM-DD
    return `${day}_${date}`;
  };

  const handleSave = async () => {
    setSaving(true);
    const docId = getDocId();
    // Always update the same document for the current day
    await setDoc(doc(db, "TimeTable", docId), {
      timetable,
      periods,
      createdAt: new Date(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Time Table Manager</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead>
            <tr>
              <th className="border px-2 py-1 bg-green-100">Class / Period</th>
              {periods.map((period) => (
                <th key={period} className="border px-2 py-1 bg-green-100">
                  {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowHeaders.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="border px-2 py-1 font-semibold bg-green-50">
                  {row}
                </td>
                {periods.map((period, periodIdx) => (
                  <td
                    key={periodIdx}
                    className="border px-2 py-1 cursor-pointer min-w-[90px] min-h-[50px] text-center align-middle relative"
                    style={{ width: 90, height: 50 }}
                    onClick={() => {
                      if (
                        timetable[row]?.[periodIdx]?.subject ||
                        timetable[row]?.[periodIdx]?.teacher ||
                        timetable[row]?.[periodIdx]?.room
                      ) {
                        // Only allow edit if cell has info
                        setEditingCell({ row, periodIdx });
                      }
                    }}
                  >
                    {editingCell.row === row &&
                    editingCell.periodIdx === periodIdx ? (
                      <div className="space-y-1">
                        <select
                          className="mb-1 w-full border rounded"
                          value={timetable[row]?.[periodIdx]?.subject || ""}
                          onChange={(e) =>
                            handleCellChange(
                              row,
                              periodIdx,
                              "subject",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Subject</option>
                          {subjects.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                        <select
                          className="mb-1 w-full border rounded"
                          value={timetable[row]?.[periodIdx]?.teacher || ""}
                          onChange={(e) =>
                            handleCellChange(
                              row,
                              periodIdx,
                              "teacher",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Teacher</option>
                          {teachers.map((teach) => (
                            <option key={teach} value={teach}>
                              {teach}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="mb-1 w-full border rounded"
                          placeholder="Room No."
                          value={timetable[row]?.[periodIdx]?.room || ""}
                          onChange={(e) =>
                            handleCellChange(
                              row,
                              periodIdx,
                              "room",
                              e.target.value
                            )
                          }
                        />
                        <button
                          className="mt-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({ row: null, periodIdx: null });
                          }}
                        >
                          Save
                        </button>
                      </div>
                    ) : timetable[row]?.[periodIdx]?.subject ||
                      timetable[row]?.[periodIdx]?.teacher ||
                      timetable[row]?.[periodIdx]?.room ? (
                      <div>
                        <div className="font-semibold text-green-800">
                          {timetable[row][periodIdx].subject}
                        </div>
                        <div className="text-xs text-gray-500">
                          {timetable[row][periodIdx].teacher}
                        </div>
                        <div className="text-xs text-gray-500">
                          {timetable[row][periodIdx].room}
                        </div>
                        <button
                          className="mt-1 text-blue-600 underline text-xs bg-transparent border-none cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({ row, periodIdx });
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-2xl flex items-center justify-center h-full w-full">
                        +
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Timetable"}
      </button>
      {saved && (
        <div className="text-green-600 font-medium mt-2">Timetable saved!</div>
      )}

      {/* Debug helpers for saving */}
      {/*
      <div className="mt-4">
        <h3 className="text-sm font-semibold">Debug Info:</h3>
        <pre className="bg-gray-100 p-2 rounded text-xs">
          {`Saving: ${saving}\nTimetable: ${JSON.stringify(
            timetable,
            null,
            2
          )}`}
        </pre>
      </div>
      */}
    </div>
  );
};

export default TimeTableManager;
