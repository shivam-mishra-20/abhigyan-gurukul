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
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-5xl mx-auto border border-green-100 min-h-[80vh] flex flex-col md:flex-row gap-8">
      {/* Left: Staff/Filters/Actions */}
      <div className="flex-1 min-w-[260px] max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-green-800 flex items-center gap-2">
          <span className="bg-green-500 w-2 h-8 rounded"></span>
          Staff Leave Records
        </h2>
        {/* Select staff */}
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700">
            Select Staff
          </label>
          <select
            className="w-full border-2 border-green-200 p-2 rounded-lg focus:outline-none focus:border-green-500 bg-green-50"
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
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <input
              type="date"
              className="border-2 border-green-200 p-2 rounded-lg flex-1 focus:outline-none focus:border-green-500 bg-green-50"
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
            <button
              onClick={markLeave}
              className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-green-700 hover:to-green-600 transition-all"
            >
              Mark Leave
            </button>
          </div>
        )}
        {/* Month filter */}
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-700">
            Filter by Month
          </label>
          <input
            type="month"
            className="border-2 border-green-200 p-2 rounded-lg focus:outline-none focus:border-green-500 bg-green-50"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
        </div>
        {confirmation && (
          <p className="mb-4 text-green-700 font-medium">{confirmation}</p>
        )}
      </div>
      {/* Right: Table */}
      <div className="flex-[2]">
        {selectedUid && filtered.length > 0 ? (
          <>
            <h3 className="font-semibold mb-3 text-green-700">
              Leaves for Selected Staff
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-white shadow">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead className="bg-green-200">
                  <tr>
                    <th className="border-b-2 border-green-300 px-4 py-3 font-bold text-green-900 text-left rounded-tl-lg">
                      #
                    </th>
                    <th className="border-b-2 border-green-300 px-4 py-3 font-bold text-green-900 text-left">
                      Date
                    </th>
                    <th className="border-b-2 border-green-300 px-4 py-3 font-bold text-green-900 text-left">
                      Formatted
                    </th>
                    {role === "admin" && (
                      <th className="border-b-2 border-green-300 px-4 py-3 font-bold text-green-900 text-left rounded-tr-lg">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((date, i) => (
                    <tr
                      key={date}
                      className="hover:bg-green-100 transition-colors"
                    >
                      <td className="border-b border-green-100 px-4 py-2 text-center font-semibold text-green-700 bg-white/80">
                        {i + 1}
                      </td>
                      <td className="border-b border-green-100 px-4 py-2 text-center font-mono bg-white/80">
                        {date}
                      </td>
                      <td className="border-b border-green-100 px-4 py-2 text-center bg-white/80">
                        {new Date(date).toDateString()}
                      </td>
                      {role === "admin" && (
                        <td className="border-b border-green-100 px-4 py-2 text-center bg-white/80">
                          <button
                            onClick={() => removeLeave(date)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-800 font-semibold px-3 py-1 rounded transition"
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
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg">
            No leave records found.
          </div>
        )}
      </div>
    </div>
  );
}
