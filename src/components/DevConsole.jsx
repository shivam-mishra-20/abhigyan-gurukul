import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { logEvent } from "../utils/logEvent";

const DevConsole = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [batchStudents, setBatchStudents] = useState([]);

  useEffect(() => {
    const fetchBatches = async () => {
      const usersSnap = await getDocs(collection(db, "Users"));
      const students = usersSnap.docs
        .map((doc) => doc.data())
        .filter((u) => u.role === "student");
      const batchMap = {};
      students.forEach((s) => {
        const batch = s.batch || "";
        batchMap[batch] = (batchMap[batch] || 0) + 1;
      });

      const sorted = Object.entries(batchMap).sort((a, b) => {
        const extractClass = (str) => parseInt(str.match(/\d+/)?.[0] || 0);
        const aClass = extractClass(a[0]);
        const bClass = extractClass(b[0]);
        return bClass - aClass;
      });

      setBatches(sorted);
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    const fetchStudentsByBatch = async () => {
      if (!selectedBatch) return;
      const q = query(
        collection(db, "Users"),
        where("role", "==", "student"),
        where("batch", "==", selectedBatch)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => doc.data());
      setBatchStudents(data);
    };
    fetchStudentsByBatch();
  }, [selectedBatch]);

  const handleSyncResults = async () => {
    try {
      toast.info("🔄 Scanning and syncing results...", { autoClose: 1500 });

      // Fetch all users
      const usersSnap = await getDocs(collection(db, "Users"));
      const students = usersSnap.docs
        .map((doc) => doc.data())
        .filter((u) => u.role === "student");

      // Fetch all results (each doc is one subject result)
      const resultSnap = await getDocs(collection(db, "Results"));
      const allResults = resultSnap.docs.map((doc) => doc.data());

      // Group results by student
      const groupedResults = {};

      for (const res of allResults) {
        const name = res.name?.trim();
        const studentClass = res.class?.trim();

        const matched = students.find(
          (s) => s.name?.trim() === name && s.Class?.trim() === studentClass
        );

        if (!matched) {
          console.warn("❌ No match for:", name, studentClass);
          continue;
        }

        const batch = matched.batch?.trim() || "";
        const docId = `${name.replace(/\s+/g, "_")}_${studentClass}_${batch}`;

        if (!groupedResults[docId]) {
          groupedResults[docId] = {
            name,
            class: studentClass,
            batch,
            results: [],
          };
        }

        groupedResults[docId].results.push({
          subject: res.subject,
          marks: res.marks,
          outOf: res.outOf,
          remarks: res.remarks,
          testDate: res.testDate,
          addedAt: res.createdAt,
        });
      }

      // Write to ActualStudentResults
      let synced = 0;
      for (const docId in groupedResults) {
        await setDoc(
          doc(db, "ActualStudentResults", docId),
          groupedResults[docId]
        );
        synced++;
      }

      toast.success(`✅ Synced ${synced} students' results.`, {
        autoClose: 3000,
      });
      await logEvent(`Synced ${synced} students' results`);
    } catch (err) {
      console.error("❌ Error syncing results:", err);
      toast.error("❌ Sync failed. Check console.", {
        autoClose: 4000,
      });
    }
  };

  const handleDeleteAll = async () => {
    const confirm = window.confirm(
      "⚠️ Are you sure you want to delete ALL records from ActualStudentResults?"
    );
    if (!confirm) return;

    try {
      const snapshot = await getDocs(collection(db, "ActualStudentResults"));
      if (snapshot.empty) {
        toast.info("ℹ️ No records to delete.", { autoClose: 2000 });
        return;
      }

      let deleted = 0;
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, "ActualStudentResults", docSnap.id));
        deleted++;
      }

      toast.success(`🗑️ Deleted ${deleted} records successfully.`, {
        autoClose: 3000,
      });
      await logEvent(`Deleted all ActualStudentResults (${deleted} records)`);
    } catch (err) {
      console.error("❌ Error deleting records:", err);
      toast.error("❌ Failed to delete records.", { autoClose: 3000 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow space-y-4">
        <h1 className="text-xl font-bold text-center">🛠️ Developer Console</h1>

        <button
          onClick={handleSyncResults}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow transition-all"
        >
          🔄 Sync Actual Results
        </button>

        <button
          onClick={handleDeleteAll}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded shadow transition-all"
        >
          🗑️ Delete All Actual Results
        </button>

        <div>
          <label className="block text-sm font-medium mb-2">
            🎯 Filter by Batch
          </label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="">-- Select Batch --</option>
            {batches.map(([batch, count]) => (
              <option key={batch} value={batch}>
                {batch || "[Empty Batch]"} ({count})
              </option>
            ))}
          </select>
        </div>

        {batchStudents.length > 0 && (
          <div className="bg-gray-100 rounded p-3 mt-3">
            <h2 className="font-semibold mb-2">
              👥 Students in {selectedBatch || "[Empty Batch]"}:
            </h2>
            <ul className="list-disc list-inside text-sm space-y-1">
              {batchStudents.map((student, i) => (
                <li key={i}>
                  {student.name} ({student.Class})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default DevConsole;
