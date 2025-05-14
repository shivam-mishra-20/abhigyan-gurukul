import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  orderBy,
  onSnapshot,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBook,
  FaFilter,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaSave,
  FaCalendarAlt,
} from "react-icons/fa";

// Shared animation variants - defined outside components to be accessible to both
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SyllabusManager = () => {
  const [syllabusItems, setSyllabusItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    description: "",
    class: "",
    subject: "",
    batch: "",
    completionStatus: 0, // 0-100%
    estimatedCompletionDate: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("studentName") || "";

  const classes = ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Social Science",
    "Computer Science",
  ];
  const batches = ["Lakshya", "Aadharshila", "Basic", "General"];

  useEffect(() => {
    // Using onSnapshot for real-time updates instead of getDocs
    const fetchSyllabusItems = async () => {
      try {
        setLoading(true);
        let syllabusRef = collection(db, "syllabus");
        let queryRef;

        // Modified query logic to avoid composite index requirements
        // Each condition uses a simple where clause without orderBy to avoid complex index needs

        if (selectedClass && selectedSubject && selectedBatch) {
          // Use a simpler approach - get all items then filter in JS
          // This avoids complex index requirements but may be less efficient for large datasets
          queryRef = query(syllabusRef, where("class", "==", selectedClass));

          const unsubscribe = onSnapshot(
            queryRef,
            (snapshot) => {
              // Filter in JavaScript instead of in the query
              const fetchedItems = snapshot.docs
                .map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }))
                .filter(
                  (item) =>
                    item.subject === selectedSubject &&
                    item.batch === selectedBatch
                )
                // Sort by creation date (if available)
                .sort((a, b) => {
                  if (!a.createdAt || !b.createdAt) return 0;
                  return b.createdAt.seconds - a.createdAt.seconds;
                });

              setSyllabusItems(fetchedItems);
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching syllabus:", error);
              setError("Failed to load syllabus items");
              setLoading(false);
            }
          );

          // Cleanup subscription on unmount
          return () => unsubscribe();
        } else if (selectedClass && selectedSubject) {
          queryRef = query(syllabusRef, where("class", "==", selectedClass));

          const unsubscribe = onSnapshot(
            queryRef,
            (snapshot) => {
              // Filter in JavaScript instead of in the query
              const fetchedItems = snapshot.docs
                .map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }))
                .filter((item) => item.subject === selectedSubject)
                // Sort by creation date (if available)
                .sort((a, b) => {
                  if (!a.createdAt || !b.createdAt) return 0;
                  return b.createdAt.seconds - a.createdAt.seconds;
                });

              setSyllabusItems(fetchedItems);
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching syllabus:", error);
              setError("Failed to load syllabus items");
              setLoading(false);
            }
          );

          // Cleanup subscription on unmount
          return () => unsubscribe();
        } else if (selectedClass) {
          queryRef = query(syllabusRef, where("class", "==", selectedClass));
        } else if (selectedSubject) {
          queryRef = query(
            syllabusRef,
            where("subject", "==", selectedSubject)
          );
        } else if (selectedBatch) {
          queryRef = query(syllabusRef, where("batch", "==", selectedBatch));
        } else {
          // If no filters, just get all items
          queryRef = query(syllabusRef);
        }

        // For the simpler queries that don't require complex filtering
        if (
          !selectedClass ||
          (!selectedSubject && selectedClass) ||
          (!selectedClass && selectedSubject) ||
          (selectedBatch && !selectedClass && !selectedSubject)
        ) {
          const unsubscribe = onSnapshot(
            queryRef,
            (snapshot) => {
              const fetchedItems = snapshot.docs
                .map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }))
                // Sort by creation date manually
                .sort((a, b) => {
                  if (!a.createdAt || !b.createdAt) return 0;
                  return b.createdAt.seconds - a.createdAt.seconds;
                });

              setSyllabusItems(fetchedItems);
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching syllabus:", error);
              setError("Failed to load syllabus items: " + error.message);
              setLoading(false);
            }
          );

          // Cleanup subscription on unmount
          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error setting up syllabus listener:", error);
        setError("Failed to connect to syllabus database: " + error.message);
        setLoading(false);
        return () => {}; // Return empty function as fallback
      }
    };

    fetchSyllabusItems();
  }, [selectedClass, selectedSubject, selectedBatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "completionStatus" ? parseInt(value) : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.topic || !formData.class || !formData.subject) {
      setError("Please fill in all required fields");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      // Create a document ID from class, batch and topic name
      const sanitizedTopic = formData.topic
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
      const sanitizedClass = formData.class.replace(/\s+/g, "").toLowerCase();
      const sanitizedBatch = (formData.batch || "general").toLowerCase();
      const customDocId = `${sanitizedClass}_${sanitizedBatch}_${sanitizedTopic}`;

      if (editingId) {
        // Update existing syllabus item
        await updateDoc(doc(db, "syllabus", editingId), {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: userName,
        });

        setSuccess("Syllabus updated successfully");

        // Update local state
        setSyllabusItems((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? { ...item, ...formData, updatedBy: userName }
              : item
          )
        );

        setEditingId(null);
      } else {
        // Check if this document ID already exists
        const docRef = doc(db, "syllabus", customDocId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setError(
            "A topic with this name already exists for this class and batch. Please use a different name."
          );
          setTimeout(() => setError(""), 5000);
          return;
        }

        // Add new syllabus item with custom ID
        await setDoc(doc(db, "syllabus", customDocId), {
          ...formData,
          createdAt: serverTimestamp(),
          createdBy: userName,
          updatedAt: serverTimestamp(),
          updatedBy: userName,
        });

        setSuccess("New syllabus item added");

        // Add to local state
        setSyllabusItems((prev) => [
          {
            id: customDocId,
            ...formData,
            createdBy: userName,
            updatedBy: userName,
          },
          ...prev,
        ]);
      }

      // Reset form
      setFormData({
        topic: "",
        description: "",
        class: "",
        subject: "",
        batch: "",
        completionStatus: 0,
        estimatedCompletionDate: "",
      });

      setShowAddForm(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving syllabus:", error);
      setError("Failed to save syllabus item: " + error.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "syllabus", id), {
        completionStatus: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: userName,
      });

      // Update local state
      setSyllabusItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, completionStatus: newStatus, updatedBy: userName }
            : item
        )
      );

      setSuccess("Progress updated");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update progress");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this syllabus item?")
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "syllabus", id));
      setSyllabusItems((prev) => prev.filter((item) => item.id !== id));
      setSuccess("Syllabus item deleted");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete syllabus item");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      topic: item.topic,
      description: item.description || "",
      class: item.class,
      subject: item.subject,
      batch: item.batch || "",
      completionStatus: item.completionStatus || 0,
      estimatedCompletionDate: item.estimatedCompletionDate || "",
    });

    setEditingId(item.id);
    setShowAddForm(true);

    // Scroll to form
    document
      .getElementById("syllabusForm")
      .scrollIntoView({ behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      topic: "",
      description: "",
      class: "",
      subject: "",
      batch: "",
      completionStatus: 0,
      estimatedCompletionDate: "",
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaBook className="mr-2 text-green-600" /> Syllabus Management
        </h2>

        {(userRole === "admin" || userRole === "teacher") && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center shadow-md"
          >
            {showAddForm ? (
              "Cancel"
            ) : (
              <>
                <FaPlus className="mr-2" /> Add Topic
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            id="syllabusForm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Syllabus Topic" : "Add New Syllabus Topic"}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    Topic Name*
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Topic name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Class*</label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
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
                  <label className="block text-gray-700 mb-1">Subject*</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Batch</label>
                  <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  <label className="block text-gray-700 mb-1">
                    Estimated Completion Date
                  </label>
                  <input
                    type="date"
                    name="estimatedCompletionDate"
                    value={formData.estimatedCompletionDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Topic description, details, and notes"
                    rows="3"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-1">
                    Current Completion: {formData.completionStatus}%
                  </label>
                  <input
                    type="range"
                    name="completionStatus"
                    min="0"
                    max="100"
                    value={formData.completionStatus}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center"
                >
                  <FaSave className="mr-2" />
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Controls */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center">
            <FaFilter className="text-gray-500 mr-2" />
            <span className="text-gray-700 font-medium">Filter:</span>
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Batches</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>

          {(selectedClass || selectedSubject || selectedBatch) && (
            <button
              onClick={() => {
                setSelectedClass("");
                setSelectedSubject("");
                setSelectedBatch("");
              }}
              className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Syllabus Items */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          <span className="ml-3 text-gray-600">Loading syllabus...</span>
        </div>
      ) : syllabusItems.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FaBook className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">
            No syllabus items found
          </h3>
          <p className="text-gray-500">
            {selectedClass || selectedSubject || selectedBatch
              ? "Try changing your filters or add new topics"
              : "Start by adding a new syllabus topic"}
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {syllabusItems.map((item) => (
            <SyllabusItem
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpdateStatus={handleUpdateStatus}
              userRole={userRole}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

const SyllabusItem = ({ item, onEdit, onDelete, onUpdateStatus, userRole }) => {
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(item.completionStatus || 0);

  // Use useEffect to update newStatus when item.completionStatus changes
  useEffect(() => {
    setNewStatus(item.completionStatus || 0);
  }, [item.completionStatus]);

  const handleStatusChange = async () => {
    if (newStatus !== item.completionStatus) {
      setIsUpdating(true);
      await onUpdateStatus(item.id, newStatus);
      setIsUpdating(false);
    }
  };

  // Calculate progress colors
  const getProgressColorClass = (status) => {
    if (status < 25) return "bg-red-500";
    if (status < 50) return "bg-yellow-500";
    if (status < 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const progressColorClass = getProgressColorClass(item.completionStatus || 0);

  const isAdmin = userRole === "admin";
  const isTeacher = userRole === "teacher";
  const isEditAllowed = isAdmin || isTeacher;

  // Format dates safely
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    try {
      if (timestamp.toDate) {
        return new Date(timestamp.toDate()).toLocaleDateString();
      } else {
        return new Date(timestamp).toLocaleDateString();
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  return (
    <motion.div
      variants={itemVariants} // Using the shared variants defined above
      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center flex-wrap">
            {item.topic}
            <span
              className={`ml-2 text-xs px-2 py-1 rounded ${
                item.subject === "Mathematics"
                  ? "bg-blue-100 text-blue-800"
                  : item.subject === "Physics"
                  ? "bg-purple-100 text-purple-800"
                  : item.subject === "Chemistry"
                  ? "bg-green-100 text-green-800"
                  : item.subject === "Biology"
                  ? "bg-red-100 text-red-800"
                  : item.subject === "English"
                  ? "bg-yellow-100 text-yellow-800"
                  : item.subject === "Social Science"
                  ? "bg-pink-100 text-pink-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {item.subject}
            </span>
            {item.batch && (
              <span className="ml-2 text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                {item.batch}
              </span>
            )}
          </h3>

          <div className="flex items-center space-x-2">
            {isEditAllowed && (
              <>
                <button
                  onClick={() => onEdit(item)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  title="Edit"
                >
                  <FaEdit />
                </button>

                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
        </div>

        <div className="mt-2">
          <div className="text-sm text-gray-600 mb-1">Class: {item.class}</div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3">
            <div className="flex flex-col flex-grow mr-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Completion Progress
                </span>
                <span className="text-sm font-medium">
                  {item.completionStatus || 0}%
                </span>
              </div>

              <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-2.5 rounded-full ${progressColorClass}`}
                  style={{ width: `${item.completionStatus || 0}%` }}
                ></div>
              </div>
            </div>

            {isEditAllowed && (
              <div className="flex items-center mt-2 sm:mt-0">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newStatus}
                  onChange={(e) => setNewStatus(parseInt(e.target.value))}
                  className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mr-2"
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStatusChange}
                  disabled={isUpdating || newStatus === item.completionStatus}
                  className={`px-2 py-1 rounded text-xs flex items-center ${
                    isUpdating
                      ? "bg-gray-400 cursor-wait"
                      : newStatus === item.completionStatus
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isUpdating ? (
                    "Saving..."
                  ) : (
                    <>
                      <FaCheck className="mr-1" /> Update
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm">
            {item.description ? (
              <p className="text-gray-700 whitespace-pre-line">
                {item.description}
              </p>
            ) : (
              <p className="text-gray-500 italic">No description provided</p>
            )}

            <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
              {item.estimatedCompletionDate && (
                <div className="flex items-center mb-1">
                  <FaCalendarAlt className="mr-1" />
                  <span>
                    Target completion:{" "}
                    {formatDate(item.estimatedCompletionDate)}
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Created by: {item.createdBy || "Unknown"}
                  {item.createdAt && ` on ${formatDate(item.createdAt)}`}
                </div>
                <div className="mt-1 sm:mt-0">
                  Last updated: {item.updatedBy || "Unknown"}
                  {item.updatedAt && ` on ${formatDate(item.updatedAt)}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SyllabusManager;
