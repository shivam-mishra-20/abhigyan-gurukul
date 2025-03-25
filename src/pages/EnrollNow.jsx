import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc, arrayUnion } from "firebase/firestore";
import { motion } from "framer-motion";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage("");

    try {
      const contactDocRef = doc(db, "contacts", "contactForm");

      // Fetch existing data (if any)
      const contactDoc = await getDoc(contactDocRef);
      const existingData = contactDoc.exists()
        ? contactDoc.data()
        : { submissions: [] };

      // Append new submission to existing data
      await setDoc(
        contactDocRef,
        {
          submissions: arrayUnion(formData),
        },
        { merge: true }
      );

      setSuccessMessage("Your form has been submitted successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("Error submitting form. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col lg:flex-row justify-center items-center min-h-screen bg-gray-100 p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Contact Info Box */}
      <motion.div
        className="w-full max-w-md lg:w-[500px] lg:h-[550px] bg-purple-500 text-white rounded-2xl shadow-xl p-6 flex flex-col items-center mb-6 lg:mb-0"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Contact Details</h2>
        <p className="text-lg">📞 Phone: +91 9829491219 / +91 9472600836</p>
        <p className="text-lg">📧 Email: abhigyangurukul@gmail.com</p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Visit Us</h3>
        <div className="w-full flex justify-center">
          <iframe
            className="w-full h-60 md:h-80 rounded-lg"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.4429600046674!2d73.12726897611714!3d22.299081279687513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc9d6048cac8f%3A0x61fadb9d55012deb!2sAbhigyan%20Gurukul!5e0!3m2!1sen!2sin!4v1741953340317!5m2!1sen!2sin"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </motion.div>

      {/* Form Box */}
      <motion.div
        className="w-full max-w-md lg:w-[500px] lg:h-[550px] bg-white rounded-2xl shadow-xl p-6 flex flex-col"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-green-600 mb-4 text-center">
          Get <span className="text-purple-600">in Touch</span>
        </h2>

        {successMessage && (
          <motion.p
            className="text-green-600 font-semibold text-center mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            aria-live="polite"
          >
            {successMessage}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <label className="text-lg font-medium">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg mb-3"
            placeholder="Enter your name"
            required
          />

          <label className="text-lg font-medium">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg mb-3"
            placeholder="Enter your email"
            required
          />

          <label className="text-lg font-medium">Phone:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg mb-3"
            placeholder="Enter your phone"
            required
          />

          <label className="text-lg font-medium">Message:</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg mb-4"
            rows="4"
            placeholder="Type your message here..."
            required
          ></textarea>

          <div className="flex flex-wrap justify-center gap-3 -mt-4">
            <motion.button
              type="reset"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setFormData({ name: "", email: "", phone: "", message: "" })
              }
            >
              Cancel
            </motion.button>

            <motion.button
              type="submit"
              className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              whileHover={!loading ? { scale: 1.05 } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ContactSection;
