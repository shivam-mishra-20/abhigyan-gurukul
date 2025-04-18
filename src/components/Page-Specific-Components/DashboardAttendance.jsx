// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   updateDoc,
//   arrayUnion,
//   setDoc,
//   getDoc,
// } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import { motion } from "framer-motion";

// export default function DashboardAttendance() {
//   const [file, setFile] = useState(null);
//   const [status, setStatus] = useState("");

//   const handleFileChange = (e) => {
//     setStatus("");
//     if (e.target.files[0]) setFile(e.target.files[0]);
//   };

//   const excelDateToISO = (value) => {
//     if (!value) return "";
//     if (!isNaN(value)) {
//       const date = new Date(Math.round((value - 25569) * 86400 * 1000));
//       return date.toISOString().split("T")[0];
//     }
//     const parsed = new Date(value);
//     return !isNaN(parsed.getTime()) ? parsed.toISOString().split("T")[0] : "";
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       setStatus("⚠️ Please select an Excel file first.");
//       return;
//     }

//     try {
//       setStatus("⏳ Processing...");
//       const data = await file.arrayBuffer();
//       const wb = XLSX.read(data, { cellDates: true });
//       const sheet = wb.Sheets[wb.SheetNames[0]];
//       const rows = XLSX.utils.sheet_to_json(sheet, { raw: false });

//       for (let row of rows) {
//         const normalized = {};
//         for (let key in row) {
//           normalized[key.trim().toUpperCase()] = row[key];
//         }

//         const cls = normalized["CLASS"]?.toString().trim();
//         const name = normalized["NAME"]?.toString().trim();
//         const clockIn = normalized["CLOCK IN"]?.toString().trim();
//         const clockOut = normalized["CLOCK OUT"]?.toString().trim();
//         const rawDate = normalized["DAY AND DATE"];
//         const dayAndDate = excelDateToISO(rawDate);

//         if (!cls || !name || !clockIn || !clockOut || !dayAndDate) {
//           console.warn("Skipping malformed row:", row);
//           continue;
//         }

//         const docId = `${name.replace(/\s+/g, "").toLowerCase()}_${cls
//           .replace(/\s+/g, "")
//           .toLowerCase()}`;
//         const docRef = doc(db, "studentLeaves", docId);
//         const docSnap = await getDoc(docRef);

//         // Create the doc if it doesn't exist
//         if (!docSnap.exists()) {
//           await setDoc(docRef, {
//             name,
//             Class: cls,
//             attendance: [],
//           });
//         }

//         const existingData = (await getDoc(docRef)).data();
//         const currentAttendance = existingData.attendance || [];

//         // Check for duplicate based on date
//         const alreadyExists = currentAttendance.some(
//           (entry) => entry.dayAndDate === dayAndDate
//         );

//         if (!alreadyExists) {
//           await updateDoc(docRef, {
//             attendance: arrayUnion({
//               clockIn,
//               clockOut,
//               dayAndDate,
//             }),
//           });
//         } else {
//           console.log(`Skipping duplicate for ${name} on ${dayAndDate}`);
//         }
//       }

//       setStatus("✅ Attendance uploaded successfully!");
//       setFile(null);
//       document.getElementById("attendance-upload").value = "";
//     } catch (err) {
//       console.error(err);
//       setStatus("❌ Failed to upload attendance.");
//     }
//   };

//   const handleSyncStudents = async () => {
//     setStatus("⏳ Syncing students...");
//     try {
//       const snap = await getDocs(
//         query(collection(db, "Users"), where("role", "==", "student"))
//       );

//       for (let docSnap of snap.docs) {
//         const { name, Class } = docSnap.data();
//         if (!name || !Class) continue;

//         const docId = `${name
//           .replace(/\s+/g, "")
//           .toLowerCase()}_${Class.replace(/\s+/g, "").toLowerCase()}`;

//         await setDoc(
//           doc(db, "studentLeaves", docId),
//           {
//             name,
//             Class,
//             attendance: [],
//           },
//           { merge: true }
//         );
//       }

//       setStatus("✅ Synced students to 'studentLeaves'.");
//     } catch (err) {
//       console.error(err);
//       setStatus("❌ Sync failed.");
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//       className="bg-white p-6 rounded shadow max-w-xl mx-auto space-y-4"
//     >
//       <h2 className="text-xl font-semibold text-center">
//         Upload Attendance Excel
//       </h2>

//       <div className="flex flex-col gap-2">
//         <input
//           id="attendance-upload"
//           type="file"
//           accept=".xlsx,.xls"
//           onChange={handleFileChange}
//           className="border p-2 rounded"
//         />

//         <button
//           onClick={handleUpload}
//           className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
//         >
//           Process & Upload
//         </button>

//         <button
//           onClick={handleSyncStudents}
//           className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
//         >
//           🔄 Sync Students
//         </button>
//       </div>

//       {status && (
//         <p
//           className={`text-center ${
//             status.startsWith("❌")
//               ? "text-red-600"
//               : status.startsWith("⚠️")
//               ? "text-yellow-600"
//               : "text-green-600"
//           }`}
//         >
//           {status}
//         </p>
//       )}
//     </motion.div>
//   );
// }

import React from "react";

export default function DashboardAttendance() {
  return <div></div>;
}
