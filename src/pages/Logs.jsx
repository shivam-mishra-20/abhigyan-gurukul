import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "Logs"),
          orderBy("timestamp", "desc"),
          limit(200)
        );
        const snap = await getDocs(q);
        setLogs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setLogs([]);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-4">System Logs</h2>
      {loading ? (
        <div>Loading logs...</div>
      ) : logs.length === 0 ? (
        <div>No logs found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Time</th>
                <th className="p-2">Username</th>
                <th className="p-2">Role</th>
                <th className="p-2">Action</th>
                <th className="p-2">Device</th>
                <th className="p-2">Browser</th>
                <th className="p-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="p-2">
                    {log.timestamp
                      ? new Date(log.timestamp.seconds * 1000).toLocaleString()
                      : ""}
                  </td>
                  <td className="p-2">{log.username}</td>
                  <td className="p-2">{log.role}</td>
                  <td className="p-2">{log.action}</td>
                  <td className="p-2">{log.device}</td>
                  <td className="p-2">{log.browser}</td>
                  <td className="p-2">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Logs;
