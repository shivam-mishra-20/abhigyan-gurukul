/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaComment, FaTimes, FaPaperPlane, FaWhatsapp } from "react-icons/fa";

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [chatMode, setChatMode] = useState("form"); // "form" or "whatsapp"
  const whatsappNumber = "+919829491219"; // Replace with your WhatsApp number

  const toggleChat = () => {
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
    setIsSending(true);

    try {
      // Create form data for FormSubmit
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("message", formData.message);
      formDataToSend.append("_subject", `Website Chat from ${formData.name}`);
      // Add a honeypot field to prevent spam
      formDataToSend.append("_honey", "");
      // Disable captcha
      formDataToSend.append("_captcha", "false");

      // Send using FormSubmit with obfuscated email
      const response = await fetch(
        "https://formsubmit.co/38cf222be60a9d293a62f4f037c17e69",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      setIsSending(false);
      setIsSent(true);

      // Reset the form after submission
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsSending(false);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleWhatsAppRedirect = () => {
    // Format message for WhatsApp
    const message = `Hello, I'm interested in learning more about Abhigyan Gurukul.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 bg-green-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        aria-label="Open chat"
      >
        {isOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <FaComment className="text-xl" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-xl z-40 overflow-hidden"
          >
            <div className="bg-green-600 text-white p-4">
              <h3 className="font-medium">Abhigyan Gurukul Chat</h3>
              <p className="text-sm text-green-100">
                Send us a message and we'll get back to you soon
              </p>

              {/* Chat mode toggle */}
              <div className="mt-3 flex bg-green-700 rounded-lg p-1">
                <button
                  className={`flex-1 py-1 px-2 text-xs font-medium rounded ${
                    chatMode === "form"
                      ? "bg-white text-green-700"
                      : "text-green-100"
                  }`}
                  onClick={() => setChatMode("form")}
                >
                  Contact Form
                </button>
                <button
                  className={`flex-1 py-1 px-2 text-xs font-medium rounded flex items-center justify-center gap-1 ${
                    chatMode === "whatsapp"
                      ? "bg-white text-green-700"
                      : "text-green-100"
                  }`}
                  onClick={() => setChatMode("whatsapp")}
                >
                  <FaWhatsapp /> WhatsApp
                </button>
              </div>
            </div>

            {chatMode === "whatsapp" ? (
              <div className="p-6 text-center">
                <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                  <FaWhatsapp className="text-3xl" />
                </div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Chat with us on WhatsApp
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Get instant responses to your queries through WhatsApp
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleWhatsAppRedirect}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                >
                  <FaWhatsapp className="text-lg" />
                  <span>Start WhatsApp Chat</span>
                </motion.button>
              </div>
            ) : isSent ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 text-center"
              >
                <div className="bg-green-100 text-green-700 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                  <FaPaperPlane className="text-2xl" />
                </div>
                <h4 className="font-medium text-gray-800 mb-2">
                  Message Sent!
                </h4>
                <p className="text-gray-600 text-sm">
                  Thank you for contacting us. We'll respond shortly.
                </p>
                <button
                  onClick={() => setIsSent(false)}
                  className="mt-4 text-green-600 font-medium text-sm hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                {/* Hidden honeypot field for spam protection */}
                <input type="text" name="_honey" style={{ display: "none" }} />

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSending}
                  className={`w-full ${
                    isSending
                      ? "bg-gray-400"
                      : "bg-green-600 hover:bg-green-700"
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
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="text-sm" />
                      <span>Send Message</span>
                    </>
                  )}
                </motion.button>

                <div className="text-xs text-center text-gray-500 mt-2">
                  We typically respond within 24 hours
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatButton;
