import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { logEvent } from "../utils/logEvent";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState("");
  const [uploading, setUploading] = useState(false);
  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("studentName");

  useEffect(() => {
    const fetchUser = async () => {
      const userRole = localStorage.getItem("userRole");
      const userName = localStorage.getItem("studentName");
      if (userRole && userName) {
        const q = query(
          collection(db, "Users"),
          where("name", "==", userName),
          where("role", "==", userRole)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setUser({ ...userData, id: snapshot.docs[0].id });
          // Fetch profile picture from storage using naming convention
          const dateStr = new Date().toISOString().split("T")[0];
          const ext = userData.profilePicUrl
            ? userData.profilePicUrl.split(".").pop().split("?")[0]
            : "png";
          const fileName = `${userData.name}_${userRole}_${dateStr}.${ext}`;
          try {
            const storage = getStorage();
            const storageRef = ref(storage, `profilePics/${fileName}`);
            const url = await getDownloadURL(storageRef);
            setProfilePic(url);
          } catch (e) {
            if (userData.profilePicUrl) setProfilePic(userData.profilePicUrl);
          }
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const storage = getStorage();
      const dateStr = new Date().toISOString().split("T")[0];
      const ext = file.name.split(".").pop();
      const fileName = `${user.name}_${userRole}_${dateStr}.${ext}`;
      const storageRef = ref(storage, `profilePics/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfilePic(url);
      // Update Firestore with the new URL so it persists on refresh
      if (user && user.id) {
        const userDoc = doc(db, "Users", user.id);
        await updateDoc(userDoc, { profilePicUrl: url });
        await logEvent("Profile picture updated");
      }
    } catch (error) {
      alert("Failed to upload profile picture");
    }
    setUploading(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg shadow">
          No user found. Please check your login details.
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-6">
          <h2 className="text-2xl font-bold text-white mb-1">User Profile</h2>
          <p className="text-green-100 text-sm">
            Manage your personal information
          </p>
        </div>

        <div className="flex flex-col items-center mt-10">
          <div className="relative">
            <img
              src={profilePic || "/default-profile.png"}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 hover:scale-105"
            />
            <label className="absolute bottom-1 right-1 bg-green-600 hover:bg-green-700 text-white rounded-full p-2 cursor-pointer shadow-md transition-all duration-200">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicChange}
                disabled={uploading}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </label>
          </div>
          {uploading && (
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full border-2 border-t-green-500 animate-spin"></div>
              Uploading image...
            </div>
          )}
        </div>

        <div className="p-6 pt-3">
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 items-center p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
              <span className="text-gray-600 col-span-1">Name</span>
              <span className="font-medium text-gray-900 col-span-2">
                {user.name}
              </span>
            </div>

            <div className="grid grid-cols-3 items-center p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
              <span className="text-gray-600 col-span-1">Role</span>
              <span className="font-medium text-gray-900 col-span-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {userRole === "developer" ? "DEVELOPER" : userRole}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-3 items-center p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
              <span className="text-gray-600 col-span-1">Email</span>
              <span className="font-medium text-gray-900 col-span-2 truncate">
                {user.email || "-"}
              </span>
            </div>

            <div className="grid grid-cols-3 items-center p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
              <span className="text-gray-600 col-span-1">Date</span>
              <span className="font-medium text-gray-900 col-span-2">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            {/* <a
              href="#"
              className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors duration-200"
            >
              Need to update your information?
            </a> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
