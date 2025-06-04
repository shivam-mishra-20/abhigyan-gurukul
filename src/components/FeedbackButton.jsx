/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCommentDots, FaTimes, FaPaperPlane } from "react-icons/fa";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    class: "",
    batch: "",
    feedbackType: "",
    customFeedback: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const classes = ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
  const batches = ["Lakshya", "Aadharshila", "Basic"];

  const feedbackTypes = [
    "Homework not given",
    "Time wasted in class",
    "Class hour not utilized properly",
    "Teacher didn't explain properly",
    "Syllabus not covered on time",
    "Other (please specify)",
  ];

  const toggleFeedback = () => {
    setIsOpen(!isOpen);
    // Reset sent state when reopening
    if (!isOpen) setIsSent(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.class || !formData.batch || !formData.feedbackType) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSending(true);

    try {
      // Determine the feedback content
      const feedbackContent =
        formData.feedbackType === "Other (please specify)"
          ? formData.customFeedback
          : formData.feedbackType;

      // Create a custom document ID using Class_Batch_Date format
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

      // Remove spaces and special characters from class and batch
      const classFormatted = formData.class.replace(/\s+/g, "");
      const batchFormatted = formData.batch.replace(/\s+/g, "");

      // Create the custom doc ID
      const customDocId = `${classFormatted}_${batchFormatted}_${dateStr}`;

      // Store in Firestore "Feedbacks" collection with custom doc ID
      await setDoc(doc(db, "Feedbacks", customDocId), {
        class: formData.class,
        batch: formData.batch,
        feedback: feedbackContent,
        timestamp: serverTimestamp(),
        date: dateStr,
      });

      setIsSending(false);
      setIsSent(true);

      // Reset the form after submission
      setFormData({
        class: "",
        batch: "",
        feedbackType: "",
        customFeedback: "",
      });
    } catch (error) {
      console.error("Failed to send feedback:", error);
      setIsSending(false);
      alert("Failed to send feedback. Please try again.");
    }
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 left-6 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleFeedback}
        aria-label="Open feedback"
      >
        {isOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <FaCommentDots className="text-xl" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 left-6 w-80 bg-white rounded-lg shadow-xl z-40 overflow-hidden"
          >
            <div className="bg-indigo-600 text-white p-4">
              <h3 className="font-medium">Daily Anonymous Feedback</h3>
              <p className="text-sm text-indigo-100">
                Your feedback helps us improve our teaching quality
              </p>
            </div>

            {isSent ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 text-center"
              >
                <div className="bg-green-100 text-green-700 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                  <FaPaperPlane className="text-2xl" />
                </div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Feedback Submitted!
                </h4>
                <p className="text-gray-600 text-sm">
                  Thank you for your valuable feedback. We'll address it
                  promptly.
                </p>
                <button
                  onClick={() => setIsSent(false)}
                  className="mt-4 text-indigo-600 font-medium text-sm hover:underline"
                >
                  Send another feedback
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Class*
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Batch*
                  </label>
                  <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    What would you like to report?*
                  </label>
                  <select
                    name="feedbackType"
                    value={formData.feedbackType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Select an issue</option>
                    {feedbackTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.feedbackType === "Other (please specify)" && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Describe the issue*
                    </label>
                    <textarea
                      name="customFeedback"
                      value={formData.customFeedback}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                      placeholder="Please provide details about the issue..."
                    ></textarea>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSending}
                  className={`w-full ${
                    isSending
                      ? "bg-gray-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2`}
                >
                  {isSending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white rounded-full border-t-transparent"
                      />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="text-sm" />
                      <span>Submit Anonymously</span>
                    </>
                  )}
                </motion.button>

                <div className="text-xs text-center text-gray-500 mt-2">
                  All feedback is anonymous and helps us improve
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackButton;
