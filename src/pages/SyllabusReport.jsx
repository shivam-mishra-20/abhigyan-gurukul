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
    <div className="p-6 md:p-8 max-w-5xl mx-auto bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-700">
              Syllabus
            </span>{" "}
            Report
          </h2>
          <p className="mt-2 text-gray-600 text-sm md:text-base">
            {userRole === "student"
              ? "View your class syllabus progress and updates"
              : "Create and manage syllabus reports for students"}
          </p>
        </div>

        {userRole !== "student" && (
          <div className="mt-4 md:mt-0 bg-white p-2 rounded-full shadow-sm flex items-center text-sm">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-gray-600 font-medium">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {userRole === "student" ? (
        loading ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-gray-200 opacity-25 animate-spin"></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-green-500 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-600">
              Loading your details...
            </p>
            <p className="text-sm text-gray-400">Please wait a moment</p>
          </div>
        ) : studentData ? (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 border-t border-green-500 transform transition-all duration-300 hover:translate-y-[-4px]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {studentData.name?.charAt(0).toUpperCase() || "S"}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {studentData.name}
                    </h3>
                    <p className="text-sm text-gray-500">Student Profile</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    {studentData.Class || "N/A"}
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {studentData.batch || "N/A"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <div className="text-sm text-gray-500 mb-1">
                    Academic Year
                  </div>
                  <div className="font-semibold text-gray-800">
                    {new Date().getFullYear()}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-400">
                  <div className="text-sm text-gray-500 mb-1">
                    Reports Available
                  </div>
                  <div className="font-semibold text-gray-800">
                    {reports.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      ></path>
                    </svg>
                    Class Reports
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {reports.length}{" "}
                    {reports.length === 1 ? "report" : "reports"} found
                  </span>
                </div>
                <p className="mt-2 text-gray-600 text-sm">
                  Latest syllabus progress reports for your class and batch
                </p>
              </div>

              {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                    No Reports Yet
                  </h4>
                  <p className="text-gray-500 text-center max-w-md">
                    No syllabus reports have been created for your class and
                    batch yet. Check back later for updates.
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {reports.map((rep) => (
                      <div
                        key={rep.id}
                        className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                ></path>
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {rep.subjects || "General Report"}
                              </h4>
                              <p className="text-xs text-gray-500">
                                Added{" "}
                                {new Date(
                                  rep.createdAt?.toDate()
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                by Teacher
                              </p>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                            {rep.date}
                          </div>
                        </div>

                        <div className="mb-3 flex items-center">
                          <svg
                            className="w-4 h-4 text-gray-500 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          <span className="text-sm text-gray-600 font-medium">
                            {rep.startTime} - {rep.endTime}
                          </span>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-100">
                          <h5 className="text-xs uppercase text-gray-500 mb-2 font-semibold tracking-wider">
                            Notes
                          </h5>
                          <p className="text-gray-700">{rep.notes}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {rep.batch} batch
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                            Details
                            <svg
                              className="w-3 h-3 ml-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No details found for your account.
                </p>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-6 text-center text-gray-700">
            Create Syllabus Report
          </h3>

          <form
            className="space-y-5"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Class
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Batch
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Subject
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Class Timing
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors mb-3"
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      value={reportStart}
                      onChange={(e) => setReportStart(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">
                      End Time
                    </label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      value={reportEnd}
                      onChange={(e) => setReportEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Notes/Description
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors min-h-[120px]"
                placeholder="Enter detailed notes about what was covered in class..."
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                required
              />
            </div>

            <div className="pt-5">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-md font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 shadow-md hover:shadow-lg transition-all"
              >
                Submit Report
              </button>

              {sent && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mt-4 flex items-center">
                  <svg
                    className="h-5 w-5 mr-2 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Report successfully submitted!
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SyllabusReport;
