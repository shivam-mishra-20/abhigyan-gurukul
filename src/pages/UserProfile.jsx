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
      }
    } catch (error) {
      alert("Failed to upload profile picture");
    }
    setUploading(false);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">No user found.</div>;

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-green-700">User Profile</h2>
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-2">
          <img
            src={profilePic || "/default-profile.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-green-400"
          />
          <label className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-1 cursor-pointer shadow-md">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePicChange}
              disabled={uploading}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M9 13h6m2 2a2 2 0 11-4 0 2 2 0 014 0zm-6 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </label>
        </div>
        {uploading && <div className="text-xs text-gray-500">Uploading...</div>}
      </div>
      <div className="space-y-4">
        <div>
          <span className="font-semibold">Name:</span> {user.name}
        </div>
        <div>
          <span className="font-semibold">Role:</span> {userRole}
        </div>
        <div>
          <span className="font-semibold">Current Date:</span>{" "}
          {new Date().toLocaleDateString()}
        </div>
        <div>
          <span className="font-semibold">Registered Email:</span>{" "}
          {user.email || "-"}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
