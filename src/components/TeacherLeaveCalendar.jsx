import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function TeacherLeaveCalendar() {
  const [staffLeaves, setStaffLeaves] = useState([]); // [{ uid, name, leaves }]
  const [leaveDates, setLeaveDates] = useState([]); // current selected leaves
  const [selectedUid, setSelectedUid] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const role = localStorage.getItem("userRole");

  // 1️⃣ Fetch all docs from teacherLeaves
  useEffect(() => {
    const fetchLeavesDocs = async () => {
      const snap = await getDocs(collection(db, "teacherLeaves"));
      const list = snap.docs.map((d) => ({
        uid: d.id,
        name: d.data().name,
        leaves: d.data().leaves || [],
      }));
      setStaffLeaves(list);

      // if logged-in teacher, auto-select their doc
      const myUid = localStorage.getItem("uid");
      if (role === "teacher" && myUid) {
        setSelectedUid(myUid);
        const me = list.find((s) => s.uid === myUid);
        if (me) setLeaveDates(me.leaves);
      }
    };
    fetchLeavesDocs();
  }, [role]);

  // helper to reload leaves when dropdown changes
  const loadLeaves = (uid) => {
    const staff = staffLeaves.find((s) => s.uid === uid);
    setLeaveDates(staff ? staff.leaves : []);
  };

  // filter by chosen month
  const filtered = leaveDates.filter((date) => {
    if (!filterMonth) return true;
    const d = new Date(date);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return m === filterMonth;
  });

  // mark a new leave (admins only)
  const markLeave = async () => {
    if (!selectedUid || !selectedDate) {
      alert("Select a staff member and a date.");
      return;
    }
    const when = selectedDate.toISOString().split("T")[0];
    const ref = doc(db, "teacherLeaves", selectedUid);
    const snap = await getDoc(ref);
    const old = snap.exists() ? snap.data().leaves || [] : [];
    const next = Array.from(new Set([...old, when]));
    await updateDoc(ref, { leaves: next });
    setLeaveDates(next);
    setConfirmation(`✅ Leave marked for ${when}`);
  };

  // remove a leave (admins only)
  const removeLeave = async (date) => {
    const next = leaveDates.filter((d) => d !== date);
    await updateDoc(doc(db, "teacherLeaves", selectedUid), { leaves: next });
    setLeaveDates(next);
    setConfirmation(`❌ Removed leave for ${date}`);
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Staff Leave Records</h2>

      {/* Select staff */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Staff</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedUid}
          onChange={(e) => {
            const uid = e.target.value;
            setSelectedUid(uid);
            setConfirmation("");
            loadLeaves(uid);
          }}
        >
          <option value="">— choose —</option>
          {staffLeaves.map((s) => (
            <option key={s.uid} value={s.uid}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Admin-only: mark new leave */}
      {role === "admin" && (
        <div className="flex gap-2 mb-4">
          <input
            type="date"
            className="border p-2 rounded flex-1"
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
          <button
            onClick={markLeave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
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

      {/* Leave table */}
      {selectedUid && filtered.length > 0 && (
        <>
          <h3 className="font-semibold mb-2">Leaves for Selected Staff</h3>
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
