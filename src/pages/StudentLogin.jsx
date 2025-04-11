import React, { useState } from "react";
import { useNavigate } from "react-router";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import bcrypt from "bcryptjs";
import { motion } from "framer-motion";

const StudentLogin = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const roles = ["students", "teachers", "admins"]; // ✅ Fixed: "admins" instead of "admin"

    try {
      for (const role of roles) {
        const q = query(
          collection(db, role),
          where("email", "==", credentials.email)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          const userData = userDoc.data();

          const isMatch = await bcrypt.compare(
            credentials.password,
            userData.password
          );

          if (!isMatch) {
            setError("❌ Incorrect password.");
            return;
          }

          // ✅ Save user data to localStorage
          localStorage.setItem("studentEmail", userData.email);
          localStorage.setItem("studentName", userData.name);
          localStorage.setItem("userRole", userData.role || "student");
          localStorage.setItem("uid", userData.uid || ""); // Optional: Save UID

          if (userData.Class) {
            localStorage.setItem("studentClass", userData.Class);
          }

          setMessage(`🎉 Welcome, ${userData.name}!`);

          // ✅ Role-based redirection
          setTimeout(() => {
            if (userData.role === "admin") {
              navigate("/student-dashboard");
            } else if (userData.role === "teacher") {
              navigate("/student-dashboard");
            } else {
              navigate("/student-dashboard");
            }
          }, 1000);

          return;
        }
      }

      setError("⚠️ User not found. Please check your email.");
    } catch (err) {
      console.error("Login error:", err);
      setError("⚠️ An error occurred during login. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-10 p-6 bg-gradient-to-br from-white to-purple-100 rounded-2xl shadow-xl"
    >
      <h2 className="text-3xl font-semibold text-green-700 text-center mb-6">
        User Login
      </h2>

      {message && <p className="text-green-600 text-center mb-3">{message}</p>}
      {error && <p className="text-red-600 text-center mb-3">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={credentials.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400"
          required
        />

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300"
        >
          Login
        </motion.button>
      </form>
    </motion.div>
  );
};

export default StudentLogin;
