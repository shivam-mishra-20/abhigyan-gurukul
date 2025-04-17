import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router";

const CreateUserPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const hashedPassword = await bcrypt.hash(formData.password, 10);

      const snapshot = await getDocs(collection(db, "Users"));
      const nextUID = snapshot.size;

      const safeName = formData.name.trim().replace(/\s+/g, "_");
      const docId = `${safeName}_${nextUID}`;

      // Build user object
      const newUserData = {
        uid: nextUID,
        name: formData.name,
        email: formData.email,
        password: hashedPassword,
        phone: formData.phone,
        role: formData.role,
        registeredAt: new Date().toISOString(),
      };

      // Add fields conditionally
      if (formData.role === "student") {
        newUserData.Class = formData.Class;
        newUserData.attendance = [];
        newUserData.remark = "";
        newUserData.results = [];
      }

      if (formData.role === "teacher") {
        newUserData.leaves = [];
      }

      // Save to Users collection
      await setDoc(doc(db, "Users", docId), newUserData);

      // Also save in teacherLeaves if teacher
      if (formData.role === "teacher") {
        const teacherLeaveRecord = {
          name: formData.name,
          leaves: [],
        };

        await setDoc(doc(db, "teacherLeaves", docId), teacherLeaveRecord);
      }

      setMessage("🎉 User created successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        Class: "",
        role: "student",
      });

      setTimeout(() => {
        navigate("/student-dashboard/admin/manage-users");
      }, 1500);
    } catch (err) {
      console.error("Create user error:", err);
      setError("Failed to create user.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto mt-10 p-6 bg-white border border-gray-200 rounded-xl shadow-md"
    >
      <h2 className="text-3xl font-semibold text-center text-blue-700 mb-4">
        Create User
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
            value={formData[field]}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300"
            required
          />
        ))}

        {formData.role === "student" && (
          <select
            name="Class"
            value={formData.Class}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none transition-all duration-300"
            required
          >
            <option value="">Select Class</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 11">Class 11</option>
            <option value="Class 12">Class 12</option>
          </select>
        )}

        <select
          name="role"
          value={formData.role}
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
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
        >
          Create User
        </motion.button>
      </form>
    </motion.div>
  );
};

export default CreateUserPage;
