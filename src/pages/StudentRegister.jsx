import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router"; // ✅ Step 1: Import useNavigate
import { notifyAuthStateChange } from "../components/Navbar";

const StudentRegister = () => {
  const navigate = useNavigate(); // ✅ Step 2: Initialize navigate

  const [student, setStudent] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    Class: "",
    role: "student",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const hashedPassword = await bcrypt.hash(student.password, 10);
      const snapshot = await getDocs(collection(db, "Users"));
      const nextUID = snapshot.size;

      const safeName = student.name.trim().replace(/\s+/g, "_");
      const docId = `${safeName}_${nextUID}`;

      const newUserData = {
        uid: nextUID,
        name: student.name,
        email: student.email,
        password: hashedPassword,
        phone: student.phone,
        role: student.role,
        registeredAt: new Date().toISOString(),
        Class: student.role === "student" ? student.Class : "",
        remarks: [],
        leaves: [],
        results: [],
      };

      // 1️⃣ Add user to unified Users collection
      await setDoc(doc(db, "Users", docId), newUserData);

      // 2️⃣ If teacher, also add to teacherLeaves collection
      if (student.role === "teacher") {
        const teacherLeavesData = {
          name: student.name,
          uid: nextUID,
          leaves: [],
        };
        await setDoc(doc(db, "teacherLeaves", docId), teacherLeavesData);
      }

      localStorage.setItem("studentName", student.name);
      localStorage.setItem("studentClass", student.Class);
      localStorage.setItem("userRole", student.role);
      localStorage.setItem("isAuthenticated", "true"); // Set authentication flag

      // Notify components about auth state change
      notifyAuthStateChange();

      setMessage("🎉 User registered successfully!");
      setStudent({
        name: "",
        email: "",
        password: "",
        phone: "",
        Class: "",
        role: "student",
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Failed to register user.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-md mx-auto mt-10 p-6 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl"
    >
      <h2 className="text-3xl font-semibold text-center text-green-700 mb-4">
        User Registration
      </h2>

      {message && (
        <div className="text-green-600 text-center mb-3">{message}</div>
      )}
      {error && <div className="text-red-600 text-center mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {["name", "email", "password", "phone"].map((field) => (
          <input
            key={field}
            name={field}
            type={
              field === "password"
                ? "password"
                : field === "email"
                ? "email"
                : "text"
            }
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={student[field]}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300"
            required
          />
        ))}

        <select
          name="Class"
          value={student.Class}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300"
          required={student.role === "student"}
        >
          <option value="">Select Class</option>
          <option value="Class 8">Class 8</option>
          <option value="Class 9">Class 9</option>
          <option value="Class 10">Class 10</option>
          <option value="Class 11">Class 11</option>
          <option value="Class 12">Class 12</option>
        </select>

        <select
          name="role"
          value={student.role}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300"
          required
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300"
        >
          Register
        </motion.button>
      </form>
    </motion.div>
  );
};
console.log("Hi");

export default StudentRegister;
