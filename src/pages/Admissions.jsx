import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaClipboardList,
  FaUserGraduate,
  FaCalendarAlt,
  FaCheckCircle,
  FaFileAlt,
  FaUserCheck,
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
} from "react-icons/fa";

const Admissions = () => {
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    class: "",
    message: "",
  });

  // Form validation state
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Email address is invalid";

    if (!formData.class) newErrors.class = "Please select a class";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Mock form submission
    setSubmitMessage(
      "Thank you! Your admission inquiry has been submitted successfully."
    );

    // Reset form after submission
    setTimeout(() => {
      setFormData({
        fullName: "",
        email: "",
        class: "",
        message: "",
      });
      setSubmitMessage("");
    }, 5000);
  };

  // Toggle FAQ accordion
  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Admission process steps
  const admissionSteps = [
    {
      icon: <FaClipboardList className="text-green-500 text-2xl" />,
      title: "Submit Application",
      description:
        "Complete the online application form with all required information and documentation.",
    },
    {
      icon: <FaFileAlt className="text-green-500 text-2xl" />,
      title: "Document Verification",
      description:
        "Our team will verify all submitted documents and academic records.",
    },
    {
      icon: <FaUserGraduate className="text-green-500 text-2xl" />,
      title: "Admission Test",
      description:
        "Qualified candidates will be invited to take an admission test to assess knowledge level.",
    },
    {
      icon: <FaUserCheck className="text-green-500 text-2xl" />,
      title: "Interview",
      description:
        "Selected students will have a personal interview with our academic council.",
    },
    {
      icon: <FaCheckCircle className="text-green-500 text-2xl" />,
      title: "Final Selection",
      description:
        "Based on test results and interview, final selections will be announced.",
    },
  ];

  // Key dates
  const keyDates = [
    { event: "Application Opens", date: "April 1, 2023" },
    { event: "Early Application Deadline", date: "May 15, 2023" },
    { event: "Regular Application Deadline", date: "June 30, 2023" },
    { event: "Admission Tests", date: "July 10-15, 2023" },
    { event: "Interview Rounds", date: "July 20-25, 2023" },
    { event: "Results Announcement", date: "August 5, 2023" },
    { event: "Registration & Fee Payment", date: "August 10-20, 2023" },
    { event: "Orientation Day", date: "August 28, 2023" },
  ];

  // FAQ data
  const faqData = [
    {
      question: "What are the minimum grade requirements?",
      answer:
        "Students must have a minimum of 70% marks in their previous academic year. For advanced courses, minimum 80% marks in relevant subjects may be required.",
    },
    {
      question: "What documents are needed for the application?",
      answer:
        "You will need to provide previous academic transcripts, proof of identity, address proof, passport-sized photographs, and transfer certificate from the previous institution.",
    },
    {
      question: "Is there a waiting list if classes are full?",
      answer:
        "Yes, we maintain a waiting list for all our programs. If a spot becomes available, we'll contact waitlisted applicants in order of merit.",
    },
    {
      question: "What are the fee payment options?",
      answer:
        "We offer various payment options including lump sum payment with a discount, semester-wise payment, and monthly installments for select courses. We accept online transfers, credit/debit cards, and bank drafts.",
    },
    {
      question: "Is there a scholarship program available?",
      answer:
        "Yes, we offer merit-based and need-based scholarships. Students can apply during the admission process by submitting the scholarship application form along with supporting documents.",
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-green-200 via-white to-blue-100 text-blue-800 py-16 px-4 md:px-8 border-b-2 border-gray-200"
      >
        <div className="container mx-auto max-w-5xl">
          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-4"
            {...fadeInUp}
          >
            Join Our Academic Excellence
          </motion.h1>
          <motion.p
            className="text-xl mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Embark on a transformative educational journey with Abhigyan
            Gurukul, where traditional wisdom meets modern teaching methods.
          </motion.p>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-green-700 px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-green-50 transition"
            onClick={() => {
              const formElement = document.getElementById("admission-form");
              formElement.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Apply Now
          </motion.button>
        </div>
      </motion.section>

      {/* Admission Process Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Admission Process
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our streamlined admission process ensures a fair and comprehensive
              evaluation of each applicant to find the perfect fit for our
              academic community.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
            variants={containerAnimation}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {admissionSteps.map((step, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center hover:border-green-300 hover:shadow-lg transition-all"
                variants={itemAnimation}
                whileHover={{ y: -5 }}
              >
                <div className="bg-green-50 p-3 rounded-full mb-4">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-800">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
                <div className="mt-4 text-green-600 font-bold text-lg">
                  Step {index + 1}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Eligibility & Requirements Section */}
      <section className="py-16 px-4 md:px-8 bg-green-50">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Eligibility & Requirements
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Make sure you meet our eligibility criteria and have all the
              required documents before applying.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-bold mb-4 text-green-700">
                Eligibility Criteria
              </h3>
              <ul className="space-y-3">
                {[
                  "Minimum 70% aggregate in previous academic year",
                  "Age-appropriate for the applied grade level",
                  "Basic English language proficiency",
                  "Successful performance in admission test",
                  "Satisfactory performance in personal interview",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-4 text-green-700">
                Required Documents
              </h3>
              <ul className="space-y-3">
                {[
                  "Completed application form",
                  "Birth certificate",
                  "Previous academic records/transcripts",
                  "Transfer certificate from previous school",
                  "4 passport-sized photographs",
                  "Residential proof of parents/guardians",
                  "Identity proof of parents/guardians",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <FaFileAlt className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Important Dates Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Important Dates
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Mark your calendars with these critical dates for the upcoming
              admission cycle.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={containerAnimation}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {keyDates.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white p-5 rounded-lg shadow-md border border-gray-100 hover:border-green-300 transition-all"
                variants={itemAnimation}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div className="flex items-center mb-3">
                  <FaCalendarAlt className="text-green-600 mr-2" />
                  <h3 className="font-bold text-gray-800">{item.event}</h3>
                </div>
                <p className="px-3 py-2 bg-green-50 text-green-800 rounded-lg text-center font-medium">
                  {item.date}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Admission Form Section */}
      <section id="admission-form" className="py-16 px-4 md:px-8 bg-green-50">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Request More Information
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fill out the form below and our admissions team will get back to
              you with more information.
            </p>
          </motion.div>

          <motion.div
            className="bg-white p-8 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {submitMessage ? (
              <div className="text-center p-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center mb-4"
                >
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaCheckCircle className="text-green-600 text-4xl" />
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold text-green-700 mb-2">
                  Thank You!
                </h3>
                <p className="text-gray-600">{submitMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="class"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Class Interested In
                  </label>
                  <select
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.class ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Class</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                  {errors.class && (
                    <p className="text-red-500 text-sm mt-1">{errors.class}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Any specific questions or information you need?"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <motion.button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Submit Request
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to commonly asked questions about our admission
              process.
            </p>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={containerAnimation}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
                variants={itemAnimation}
              >
                <button
                  className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium text-gray-800">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <FaChevronUp className="text-green-600" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-gray-50 border-t border-gray-200"
                  >
                    <p className="text-gray-600">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 px-4 md:px-8 bg-green-600 text-white text-center">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-lg mb-8 opacity-90">
              Our admissions team is here to help you through every step of the
              process.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a
                href="tel:+919829491219"
                className="flex items-center bg-white text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaEnvelope className="mr-2" />
                Contact Admissions
              </motion.a>
              <motion.a
                href="/enrollnow"
                className="flex items-center bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition border border-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Schedule Campus Visit
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Admissions;
