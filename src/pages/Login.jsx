import React, { useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router";
import bcrypt from "bcryptjs";

const Login = () => {
  const navigate = useNavigate();
  const db = getFirestore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      try {
        await signInWithEmailAndPassword(auth, email, password);

        // Add auth tracking for admin login as well
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("studentName", "Admin");

        // Notify components about auth state change
        notifyAuthStateChange();

        navigate("/dashboard"); // Redirect on successful login
        return; // Exit function after successful Firebase auth
      } catch (firebaseError) {
        // If Firebase auth fails, continue with Firestore authentication
      }

      // Query user from Firestore by email
      const q = query(collection(db, "Users"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("User not found.");
        return;
      }

      const docSnap = snapshot.docs[0];
      const userData = docSnap.data();

      // Validate password using bcrypt
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (!passwordMatch) {
        setError("Invalid email or password.");
        return;
      }

      // ✅ Store user data and timestamp
      localStorage.setItem("role", userData.role);
      localStorage.setItem("studentClass", userData.Class);
      localStorage.setItem("studentBatch", userData.batch);
      localStorage.setItem("studentName", userData.name);
      localStorage.setItem("studentEmail", userData.email);
      localStorage.setItem("uid", userData.uid);
      localStorage.setItem("loginTimestamp", Date.now().toString());

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center text-purple-600">
          User Login
        </h2>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        <form onSubmit={handleLogin} className="mt-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
