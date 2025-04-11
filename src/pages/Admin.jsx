import React, { useEffect, useState } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router";
import { db } from "../firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const AdminDashboard = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [adminEmails, setAdminEmails] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        await fetchContactSubmissions();
        await fetchAdminEmails();
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchContactSubmissions = async () => {
    try {
      const docRef = doc(db, "contacts", "contactForm");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setSubmissions(data.submissions || []);
      } else {
        console.log("No submissions found.");
      }
    } catch (error) {
      console.error("Error fetching submissions: ", error);
    }
  };

  const fetchAdminEmails = async () => {
    try {
      const docRef = doc(db, "settings", "adminEmails");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAdminEmails(docSnap.data().emails || []);
      } else {
        setAdminEmails([]);
      }
    } catch (error) {
      console.error("Error fetching admin emails:", error);
    }
  };

  const handleAddAdminEmail = async (e) => {
    e.preventDefault();
    if (!newAdminEmail || !user) return;

    try {
      const docRef = doc(db, "settings", "adminEmails");
      const updatedEmails = [...new Set([...adminEmails, newAdminEmail])];
      await setDoc(docRef, { emails: updatedEmails }, { merge: true });
      setAdminEmails(updatedEmails);
      setNewAdminEmail("");
      setMessage("✅ Admin email added!");
    } catch (err) {
      console.error("Error adding admin email:", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/adminlogin");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-purple-600 text-center">
          Admin Dashboard
        </h2>
        {user && (
          <p className="text-lg text-center mt-2">Welcome, {user.email}</p>
        )}

        {/* Contact Submissions */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-purple-600 mb-3">
            Users Registered (Contact Submissions)
          </h3>

          {submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-purple-500 text-white">
                    <th className="border border-gray-300 p-2">Name</th>
                    <th className="border border-gray-300 p-2">Email</th>
                    <th className="border border-gray-300 p-2">Phone</th>
                    <th className="border border-gray-300 p-2">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, index) => (
                    <tr key={index} className="bg-gray-50 even:bg-gray-100">
                      <td className="border border-gray-300 p-2">
                        {submission.name || "N/A"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {submission.email || "N/A"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {submission.phone || "N/A"}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {submission.message || "No message"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No contact form submissions found.</p>
          )}
        </div>

        {/* Admin Email Form */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-purple-600 mb-3">
            Add Admin Email
          </h3>
          <form onSubmit={handleAddAdminEmail} className="flex gap-4 flex-wrap">
            <input
              type="email"
              placeholder="Enter new admin email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              required
              className="flex-1 px-4 py-2 rounded border border-gray-300"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Add Admin
            </button>
          </form>
          {message && <p className="text-green-600 mt-2">{message}</p>}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-10 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
