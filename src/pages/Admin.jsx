import React, { useEffect, useState } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const AdminDashboard = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]); // Holds multiple submissions

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        fetchContactSubmissions();
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
        setSubmissions(data.submissions || []); // Store the array of submissions
      } else {
        console.log("No submissions found.");
      }
    } catch (error) {
      console.error("Error fetching submissions: ", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
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

        {/* Contact Submissions List */}
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

        <button
          onClick={handleLogout}
          className="mt-6 px-6 py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
