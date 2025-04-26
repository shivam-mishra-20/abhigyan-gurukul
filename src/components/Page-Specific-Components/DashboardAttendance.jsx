// src/components/Page-Specific-Components/DashboardAttendance.jsx
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { motion } from "framer-motion";

export default function DashboardAttendance() {
  // — state —
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(""); // "YYYY-MM"
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6;

  const userRole = localStorage.getItem("userRole");
  const studentName = localStorage.getItem("studentName") || "";
  const studentClass = localStorage.getItem("studentClass") || "";

  // — helpers —
  const excelDateToISO = (value) => {
    if (!value) return "";
    // Excel serial?
    if (!isNaN(value)) {
      const d = new Date(Math.round((value - 25569) * 86400 * 1000));
      return d.toISOString().split("T")[0];
    }
    const parsed = new Date(value);
    return !isNaN(parsed) ? parsed.toISOString().split("T")[0] : "";
  };

  // — Admin/Teacher: handle file selection —
  const handleFileChange = (e) => {
    setStatus("");
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  // — Admin/Teacher: process & upload Excel —
  const handleUpload = async () => {
    if (!file) {
      setStatus("⚠️ Please select an Excel file first.");
      return;
    }
    try {
      setStatus("⏳ Processing...");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });
      console.log("Parsed rows:", rows);

      for (let row of rows) {
        // 1️⃣ normalize headers to lowercase keys
        const norm = {};
        Object.entries(row).forEach(([k, v]) => {
          norm[k.trim().toLowerCase()] = v;
        });

        const cls = norm["class"]?.toString().trim();
        const name = norm["name"]?.toString().trim();
        const clockIn = norm["clock in"]?.toString().trim();
        const clockOut = norm["clock out"]?.toString().trim();
        const rawDate = norm["day and date"];
        // 2️⃣ convert date to ISO format
        // Excel date format (serial number) or string date (e.g., "2023-10-01")
        const dayAndDate = excelDateToISO(rawDate);

        if (!cls || !name || !clockIn || !clockOut || !dayAndDate) {
          console.warn("Skipping malformed row:", row);
          continue;
        }

        // build doc ID (must match your sync logic)
        const docId = `${name.replace(/\s+/g, "").toLowerCase()}_${cls
          .replace(/\s+/g, "")
          .toLowerCase()}`;
        const ref = doc(db, "studentLeaves", docId);

        // ensure it exists
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, { name, Class: cls, attendance: [] });
        }

        // append if not duplicate
        const data = (await getDoc(ref)).data();
        const arr = data.attendance || [];
        if (!arr.some((e) => e.dayAndDate === dayAndDate)) {
          await updateDoc(ref, {
            attendance: arrayUnion({ clockIn, clockOut, dayAndDate }),
          });
        }
      }

      setStatus("✅ Attendance uploaded successfully!");
      setFile(null);
      document.getElementById("attendance-upload").value = "";
    } catch (e) {
      console.error(e);
      setStatus("❌ Failed to upload attendance.");
    }
  };

  // — Admin/Teacher: sync all students into studentLeaves (no overwrite) —
  // 🔄 Sync student entries from Users → studentLeaves (without wiping existing attendance)
  const handleSyncStudents = async () => {
    setStatus("⏳ Syncing students...");
    try {
      const snap = await getDocs(
        query(collection(db, "Users"), where("role", "==", "student"))
      );

      for (let u of snap.docs) {
        const { name, Class } = u.data();
        if (!name || !Class) continue;

        const docId = `${name
          .replace(/\s+/g, "")
          .toLowerCase()}_${Class.replace(/\s+/g, "").toLowerCase()}`;
        const ref = doc(db, "studentLeaves", docId);

        // only create if it doesn't already exist
        const existing = await getDoc(ref);
        if (existing.exists()) {
          continue;
        }

        // create new doc with empty attendance array
        await setDoc(ref, {
          name,
          Class,
          attendance: [],
        });
      }

      setStatus("✅ Synced students to 'studentLeaves'.");
    } catch (e) {
      console.error(e);
      setStatus("❌ Sync failed.");
    }
  };

  // — Student: load their attendance via query on name & class —
  useEffect(() => {
    if (userRole === "student") {
      (async () => {
        try {
          const q = query(
            collection(db, "studentLeaves"),
            where("name", "==", studentName),
            where("Class", "==", studentClass)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            setAttendanceRecords(snap.docs[0].data().attendance || []);
          } else {
            setAttendanceRecords([]);
          }
        } catch (e) {
          console.error("Error loading attendance:", e);
        }
      })();
    }
  }, [userRole, studentName, studentClass]);

  // — Filtering by month —
  const filtered = attendanceRecords.filter((rec) => {
    if (!selectedMonth) return true;
    const d = new Date(rec.dayAndDate);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return m === selectedMonth;
  });

  // — Pagination setup —
  const totalPages = Math.ceil(filtered.length / recordsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-6 rounded shadow max-w-xl mx-auto space-y-6"
    >
      <h2 className="text-xl font-semibold text-center">Attendance Panel</h2>

      {/* Admin/Teacher Controls */}
      {userRole !== "student" && (
        <div className="flex flex-col gap-2">
          <input
            id="attendance-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="border p-2 rounded"
          />
          <button
            onClick={handleUpload}
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Process & Upload
          </button>
          <button
            onClick={handleSyncStudents}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            🔄 Sync Students
          </button>
        </div>
      )}

      {/* Student View */}
      {userRole === "student" && (
        <div className="space-y-4">
          {/* Month filter + clear */}
          <div className="flex gap-4 items-center">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="border p-2 rounded"
            />
            <button
              onClick={() => {
                setSelectedMonth("");
                setCurrentPage(1);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Clear Filter
            </button>
          </div>

          {/* Table or empty state */}
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 italic">
              No attendance records.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 bg-white">
                  <thead className="bg-blue-100 text-blue-900">
                    <tr>
                      <th className="border px-4 py-2 text-left">#</th>
                      <th className="border px-4 py-2 text-left">Date</th>
                      <th className="border px-4 py-2 text-left">Clock In</th>
                      <th className="border px-4 py-2 text-left">Clock Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((rec, i) => (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="border px-4 py-2">
                          {(currentPage - 1) * recordsPerPage + i + 1}
                        </td>
                        <td className="border px-4 py-2">{rec.dayAndDate}</td>
                        <td className="border px-4 py-2">{rec.clockIn}</td>
                        <td className="border px-4 py-2">{rec.clockOut}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === idx + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Status message */}
      {status && (
        <p
          className={`text-center ${
            status.startsWith("❌")
              ? "text-red-600"
              : status.startsWith("⚠️")
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {status}
        </p>
      )}
    </motion.div>
  );
}
