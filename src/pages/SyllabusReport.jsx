import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

const SyllabusReport = () => {
  const userRole = localStorage.getItem("userRole");
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportClass, setReportClass] = useState("");
  const [reportBatch, setReportBatch] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportStart, setReportStart] = useState("");
  const [reportEnd, setReportEnd] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [reportSubjects, setReportSubjects] = useState("");
  const [sent, setSent] = useState(false);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchStudent = async () => {
      if (userRole === "student") {
        setLoading(true);
        const username = localStorage.getItem("studentName");
        const q = query(collection(db, "Users"), where("name", "==", username));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setStudentData(snapshot.docs[0].data());
        }
        setLoading(false);
      }
    };
    fetchStudent();
  }, [userRole]);

  useEffect(() => {
    const fetchReports = async () => {
      if (userRole === "student" && studentData) {
        const classString = studentData.Class?.toString().startsWith("Class ")
          ? studentData.Class
          : `Class ${studentData.Class}`;
        const q = query(
          collection(db, "SyllabusReport"),
          where("class", "==", classString),
          where("batch", "==", studentData.batch)
        );
        const snapshot = await getDocs(q);
        setReports(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    };
    fetchReports();
  }, [userRole, studentData]);

  useEffect(() => {
    setReportDate(new Date().toISOString().split("T")[0]); // Set today's date as default
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Syllabus Report</h2>
      {userRole === "student" ? (
        loading ? (
          <p>Loading your details...</p>
        ) : studentData ? (
          <>
            <div className="space-y-2 mb-6">
              <div>
                <b>Username:</b> {studentData.name}
              </div>
              <div>
                <b>Class:</b> {studentData.Class || "N/A"}
              </div>
              <div>
                <b>Batch:</b> {studentData.batch || "N/A"}
              </div>
            </div>
            <div className="bg-white rounded shadow p-4 border border-gray-100">
              <h3 className="font-semibold mb-2 text-green-700">
                Class Reports
              </h3>
              {reports.length === 0 ? (
                <div className="text-gray-400">
                  No reports for your class and batch.
                </div>
              ) : (
                <ul className="space-y-2">
                  {reports.map((rep) => (
                    <li
                      key={rep.id}
                      className="bg-green-50 border-l-4 border-green-400 p-3 rounded"
                    >
                      <div className="text-sm text-gray-700">
                        <b>Date:</b> {rep.date} <b>Time:</b> {rep.startTime} -{" "}
                        {rep.endTime}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <b>Subjects:</b> {rep.subjects || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <b>Notes:</b> {rep.notes}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <p>No details found for your account.</p>
        )
      ) : (
        <form
          className="space-y-4 bg-white p-4 rounded shadow border border-gray-100"
          onSubmit={async (e) => {
            e.preventDefault();
            await addDoc(collection(db, "SyllabusReport"), {
              class: `Class ${reportClass}`,
              batch: reportBatch,
              date: reportDate,
              startTime: reportStart,
              endTime: reportEnd,
              subjects: reportSubjects,
              notes: reportNotes,
              createdAt: new Date(),
              sender: userRole,
            });
            setSent(true);
            setTimeout(() => setSent(false), 2000);
            setReportClass("");
            setReportBatch("");
            setReportDate(new Date().toISOString().split("T")[0]);
            setReportStart("");
            setReportEnd("");
            setReportSubjects("");
            setReportNotes("");
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Class</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={reportClass}
              onChange={(e) => setReportClass(e.target.value)}
              required
            >
              <option value="">Select class</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Batch</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={reportBatch}
              onChange={(e) => setReportBatch(e.target.value)}
              required
            >
              <option value="">Select batch</option>
              <option value="Lakshya">Lakshya</option>
              <option value="Aadharshila">Aadharshila</option>
              <option value="Basic">Basic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subjects</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={reportSubjects}
              onChange={(e) => setReportSubjects(e.target.value)}
              required
            >
              <option value="">Select subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="English">English</option>
              <option value="Biology">Biology</option>
              <option value="Language">Language</option>
              <option value="Social Science">Social Science</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Timings</label>
            <select
              className="w-full border rounded px-3 py-2 mb-2"
              value={reportStart + "-" + reportEnd}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "custom") {
                  setReportStart("");
                  setReportEnd("");
                } else {
                  const [start, end] = val.split("-");
                  setReportStart(start);
                  setReportEnd(end);
                }
              }}
              required={!reportStart || !reportEnd}
            >
              <option value="">Select timing</option>
              <option value="15:30-16:30">3:30PM-4:30PM</option>
              <option value="16:30-17:30">4:30PM-5:30PM</option>
              <option value="17:30-18:30">5:30PM-6:30PM</option>
              <option value="18:30-19:30">6:30PM-7:30PM</option>
              <option value="19:30-20:30">7:30PM-8:30PM</option>
              <option value="custom">Custom</option>
            </select>
            {(reportStart === "" || reportEnd === "") && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="w-full border rounded px-3 py-2"
                    value={reportStart}
                    onChange={(e) => setReportStart(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="w-full border rounded px-3 py-2"
                    value={reportEnd}
                    onChange={(e) => setReportEnd(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Notes/Description
            </label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[80px]"
              placeholder="Type your notes here..."
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
          >
            Submit Report
          </button>
          {sent && (
            <div className="text-green-600 font-medium mt-2">
              Report submitted!
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default SyllabusReport;
