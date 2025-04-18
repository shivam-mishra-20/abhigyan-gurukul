import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function DashboardAttendance() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setStatus("");
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("⚠️ Please select an Excel file first.");
      return;
    }

    try {
      setStatus("⏳ Processing...");
      // 1. Read the file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      // 2. For each row, find that student and append attendance
      for (let row of rows) {
        const cls = row["CLASS"];
        const name = row["NAME"];
        const clockIn = row["CLOCK IN"];
        const clockOut = row["CLOCK OUT"];
        const dayDate = row["DAY AND DATE"];

        // Query for the student doc
        const q = query(
          collection(db, "Users"),
          where("role", "==", "student"),
          where("Class", "==", cls),
          where("name", "==", name)
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          console.warn(`No student found for ${name} in ${cls}`);
          continue;
        }
        const userDoc = snap.docs[0];
        const userRef = doc(db, "Users", userDoc.id);

        // Append this attendance record
        await updateDoc(userRef, {
          attendance: arrayUnion({
            date: dayDate,
            clockIn,
            clockOut,
          }),
        });
      }

      setStatus("✅ Attendance uploaded successfully!");
      setFile(null);
      // reset file input
      document.getElementById("attendance-upload").value = "";
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to upload attendance. See console.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-6 rounded shadow max-w-xl mx-auto space-y-4"
    >
      <h2 className="text-xl font-semibold text-center">
        Upload Attendance Excel
      </h2>

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
      </div>

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
