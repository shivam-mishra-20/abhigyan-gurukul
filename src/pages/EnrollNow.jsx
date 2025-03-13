import React, { useState } from "react";
import { db } from "../firebaseConfig"; // Ensure the path is correct
import { collection, addDoc } from "firebase/firestore";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Add data to Firestore
      await addDoc(collection(db, "contacts"), formData);

      alert("Form submitted successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" }); // Reset form
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error submitting form. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
      {/* Contact Info Box */}
      <div className="w-[500px] h-[550px] bg-purple-500 text-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Contact Details</h2>
        <p className="text-lg">
          <span className="mr-2">📞</span> Phone: +123 456 7890
        </p>
        <p className="text-lg">
          <span className="mr-2">📧</span> Email: contact@abhigyangurukul.com
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Visit Us</h3>
        <div className="w-full flex justify-center">
          <iframe
            className="w-100 h-80 rounded-lg"
            src="https://www.google.com/maps/embed?pb=ACTUAL_GOOGLE_MAPS_EMBED_URL"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      {/* Form Box */}
      <div className="w-[500px] h-[550px] bg-white rounded-2xl shadow-xl p-6 ml-6 flex flex-col">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Get <span className="text-purple-600">in Touch</span>
        </h2>

        <form onSubmit={handleSubmit}>
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

          <div className="flex justify-between">
            <button
              type="reset"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
              onClick={() =>
                setFormData({ name: "", email: "", phone: "", message: "" })
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactSection;
