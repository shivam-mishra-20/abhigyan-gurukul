import React, { useEffect, useState } from "react";
import { getDocs, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import jsPDF from "jspdf";
import "jspdf-autotable";

const TeacherLeaveCalendar = () => {
  const [leaveDates, setLeaveDates] = useState([]);
  const [allTeachersLeaves, setAllTeachersLeaves] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const role = localStorage.getItem("userRole");

  useEffect(() => {
    const fetchLeaves = async () => {
      const snapshot = await getDocs(collection(db, "teacherLeaves"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const currentUserId = localStorage.getItem("userId");

      if (role === "teacher") {
        const teacherData = data.find((t) => t.id === currentUserId);
        setLeaveDates(teacherData?.leaves || []);
      } else if (role === "admin") {
        setAllTeachersLeaves(data);
      }
    };
    fetchLeaves();
  }, [role]);

  const filteredLeaves = leaveDates.filter((date) => {
    if (!filterMonth) return true;
    const d = new Date(date);
    const monthString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    return filterMonth === monthString;
  });

  const handleLeaveSubmit = async () => {
    if (!selectedTeacherId || !selectedDate) {
      alert("Please select a teacher and a date.");
      return;
    }

    const formattedDate = selectedDate.toISOString().split("T")[0];
    const teacherDocRef = doc(db, "teacherLeaves", selectedTeacherId);
    const selectedTeacher = allTeachersLeaves.find(
      (t) => t.id === selectedTeacherId
    );

    const updatedLeaves = selectedTeacher?.leaves
      ? [...new Set([...selectedTeacher.leaves, formattedDate])]
      : [formattedDate];

    try {
      await updateDoc(teacherDocRef, { leaves: updatedLeaves });
      setConfirmation(`Leave marked for ${formattedDate}`);
      setLeaveDates(updatedLeaves);
    } catch (error) {
      console.error("Error updating leave:", error);
      setConfirmation("Failed to mark leave.");
    }
  };

  const handleRemoveLeave = async (dateToRemove) => {
    const teacherDocRef = doc(db, "teacherLeaves", selectedTeacherId);
    const updatedLeaves = leaveDates.filter((date) => date !== dateToRemove);

    try {
      await updateDoc(teacherDocRef, { leaves: updatedLeaves });
      setConfirmation(`Removed leave for ${dateToRemove}`);
      setLeaveDates(updatedLeaves);
    } catch (error) {
      console.error("Error removing leave:", error);
      setConfirmation("Failed to remove leave.");
    }
  };

  // 📄 Export all teachers' leave records
  const handleExportAllTeachersPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("All Teachers' Leave Records", 14, 16);
    let y = 24;

    allTeachersLeaves.forEach((teacher, index) => {
      const name = teacher.name || `Teacher ${index + 1}`;
      const leaves = (teacher.leaves || []).filter((date) => {
        if (!filterMonth) return true;
        const d = new Date(date);
        const monthString = `${d.getFullYear()}-${String(
          d.getMonth() + 1
        ).padStart(2, "0")}`;
        return filterMonth === monthString;
      });

      if (leaves.length === 0) return;

      doc.setFontSize(12);
      doc.text(`${name}`, 14, y);
      y += 6;

      const rows = leaves
        .sort((a, b) => new Date(b) - new Date(a))
        .map((date, idx) => [idx + 1, date, new Date(date).toDateString()]);

      doc.autoTable({
        head: [["#", "Date", "Formatted"]],
        body: rows,
        startY: y,
        margin: { left: 14 },
        theme: "grid",
        styles: { fontSize: 10 },
        didDrawPage: (data) => {
          y = data.cursor.y + 10;
        },
      });

      y += 10;
    });

    doc.save("all_teacher_leaves.pdf");
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded shadow max-w-full overflow-x-hidden">
      <h2 className="text-lg font-bold mb-4 text-center md:text-left">
        Teacher Leave Records
      </h2>

      {/* ...Teacher View code stays same... */}

      {role === "admin" && (
        <>
          {/* Teacher selection and mark leave */}
          <div className="flex flex-col gap-3 mb-6">
            <label className="text-sm font-medium">Select Teacher</label>
            <select
              className="border p-2 rounded w-full"
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                const teacher = allTeachersLeaves.find(
                  (t) => t.id === e.target.value
                );
                setLeaveDates(teacher?.leaves || []);
                setConfirmation("");
              }}
              value={selectedTeacherId}
            >
              <option value="">-- Choose --</option>
              {allTeachersLeaves.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <label className="text-sm font-medium">Select Date</label>
            <input
              type="date"
              className="border p-2 rounded w-full"
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />

            <button
              className="w-full md:w-fit mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              onClick={handleLeaveSubmit}
            >
              Mark Leave
            </button>
          </div>

          {/* Filter and export all PDF */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div>
              <label className="block text-sm font-medium">
                Filter by Month
              </label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="border p-2 rounded w-full sm:w-60"
              />
            </div>

            <button
              onClick={handleExportAllTeachersPDF}
              className="text-sm bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Export All PDF
            </button>
          </div>

          {/* Show selected teacher's leave table if selected */}
          {confirmation && (
            <p className="text-sm text-green-700 font-semibold mb-4">
              {confirmation}
            </p>
          )}

          {selectedTeacherId && leaveDates.length > 0 && (
            <>
              <h3 className="text-md font-semibold mb-2">
                Leaves for Selected Teacher
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border">#</th>
                      <th className="px-4 py-2 border">Date</th>
                      <th className="px-4 py-2 border">Formatted</th>
                      <th className="px-4 py-2 border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves
                      .sort((a, b) => new Date(b) - new Date(a))
                      .map((date, idx) => (
                        <tr key={date}>
                          <td className="px-4 py-2 border">{idx + 1}</td>
                          <td className="px-4 py-2 border">{date}</td>
                          <td className="px-4 py-2 border">
                            {new Date(date).toDateString()}
                          </td>
                          <td className="px-4 py-2 border text-center">
                            <button
                              onClick={() => handleRemoveLeave(date)}
                              className="text-red-500 hover:underline text-xs"
                            >
                              ❌ Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherLeaveCalendar;
