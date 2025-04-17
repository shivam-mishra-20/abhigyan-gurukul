import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function TeacherLeaveCalendar() {
  const [staff, setStaff] = useState([]); // now holds both teachers & admins
  const [leaveDates, setLeaveDates] = useState([]);
  const [selectedUid, setSelectedUid] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const role = localStorage.getItem("userRole");
  const myUid = localStorage.getItem("uid");

  // 1️⃣ Fetch staff (teachers + admins) and pre‑select when appropriate
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        // fetch all users...
        const snap = await getDocs(collection(db, "Users"));
        const all = snap.docs.map((d) => ({
          ...d.data(),
          id: d.id,
          uid: d.data().uid?.toString(),
        }));
        // ...then keep only teachers or admins
        const list = all.filter(
          (u) => u.role === "teacher" || u.role === "admin"
        );
        setStaff(list);

        // if I'm a teacher, auto‑load my leaves
        if (role === "teacher" && myUid) {
          setSelectedUid(myUid);
          await loadLeaves(myUid);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStaff();
  }, [role, myUid]);

  // helper to load leaves for a given uid
  const loadLeaves = async (uid) => {
    const dSnap = await getDoc(doc(db, "teacherLeaves", uid));
    setLeaveDates(dSnap.exists() ? dSnap.data().leaves || [] : []);
  };

  const filtered = leaveDates.filter((date) => {
    if (!filterMonth) return true;
    const d = new Date(date);
    return (
      filterMonth ===
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  });

  const markLeave = async () => {
    if (!selectedUid || !selectedDate) {
      alert("Select a staff member and a date.");
      return;
    }
    const dStr = selectedDate.toISOString().split("T")[0];
    const ref = doc(db, "teacherLeaves", selectedUid);
    const snap = await getDoc(ref);
    const old = snap.exists() ? snap.data().leaves || [] : [];
    const next = [...new Set([...old, dStr])];
    // find name
    const person = staff.find((s) => s.uid === selectedUid);
    await updateDoc(ref, { name: person?.name || "", leaves: next });
    setLeaveDates(next);
    setConfirmation(`✅ Leave marked for ${dStr}`);
  };

  const removeLeave = async (date) => {
    const next = leaveDates.filter((d) => d !== date);
    await updateDoc(doc(db, "teacherLeaves", selectedUid), { leaves: next });
    setLeaveDates(next);
    setConfirmation(`❌ Removed leave for ${date}`);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Staff Leave Records</h2>

      {/* Select any teacher or admin */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Staff</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedUid}
          onChange={async (e) => {
            const uid = e.target.value;
            setSelectedUid(uid);
            setConfirmation("");
            await loadLeaves(uid);
          }}
        >
          <option value="">— choose —</option>
          {staff.map((s) => (
            <option key={s.uid} value={s.uid}>
              {s.name} ({s.role})
            </option>
          ))}
        </select>
      </div>

      {/* Only admins can mark new leaves */}
      {role === "admin" && (
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            className="border p-2 rounded flex-1"
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
          <button
            onClick={markLeave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Mark Leave
          </button>
        </div>
      )}

      {/* Month filter */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Filter by Month</label>
        <input
          type="month"
          className="border p-2 rounded"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />
      </div>

      {confirmation && <p className="mb-4 text-green-700">{confirmation}</p>}

      {/* Leave list */}
      {selectedUid && filtered.length > 0 && (
        <>
          <h3 className="font-semibold mb-2">Leaves for selected staff</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-1">#</th>
                  <th className="border px-3 py-1">Date</th>
                  <th className="border px-3 py-1">Formatted</th>
                  {role === "admin" && (
                    <th className="border px-3 py-1">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((date, i) => (
                  <tr key={date} className="hover:bg-gray-50">
                    <td className="border px-3 py-1">{i + 1}</td>
                    <td className="border px-3 py-1">{date}</td>
                    <td className="border px-3 py-1">
                      {new Date(date).toDateString()}
                    </td>
                    {role === "admin" && (
                      <td className="border px-3 py-1 text-center">
                        <button
                          onClick={() => removeLeave(date)}
                          className="text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
