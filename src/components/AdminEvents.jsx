import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db, storage } from "../firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaSave,
  FaTimes,
  FaImage,
  FaUpload,
  FaTrash,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaExclamationTriangle,
  FaLink,
} from "react-icons/fa";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { logEvent } from "../utils/logEvent";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    images: [],
    badge: "None",
    featured: false,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isAddingFromUrl, setIsAddingFromUrl] = useState(false);
  const [multipleUrls, setMultipleUrls] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const eventsQuery = query(
        collection(db, "events"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(eventsQuery);
      const eventsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        images: doc.data().images || [doc.data().image].filter(Boolean),
      }));
      setEvents(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
      setErrorMessage("Failed to load events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentEvent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    setUploadingImages(true);
    setErrorMessage("");

    try {
      const uploadResults = [];
      let completedUploads = 0;

      console.log(
        "Storage bucket:",
        import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
      );

      const uploadImage = async (file) => {
        try {
          if (!file.type.match("image.*")) {
            return {
              status: "error",
              name: file.name,
              message: "Not an image file",
            };
          }

          if (file.size > 5 * 1024 * 1024) {
            return {
              status: "error",
              name: file.name,
              message: "File too large (max 5MB)",
            };
          }

          const localUrl = URL.createObjectURL(file);

          try {
            const timestamp = new Date().getTime();
            const fileExtension = file.name.split(".").pop();
            const fileName = `events/${uuidv4()}-${timestamp}.${fileExtension}`;
            const storageRef = ref(storage, fileName);

            console.log(
              `Attempting to upload ${file.name} to bucket:`,
              storage._service.app.options.storageBucket
            );

            const metadata = {
              contentType: file.type,
              cacheControl: "public,max-age=31536000",
            };

            const arrayBuffer = await file.arrayBuffer();
            const uploadTask = await uploadBytes(
              storageRef,
              arrayBuffer,
              metadata
            );
            console.log("Upload successful:", uploadTask);

            const downloadURL = await getDownloadURL(storageRef);

            return {
              status: "success",
              name: file.name,
              url: downloadURL,
              path: fileName,
              contentType: file.type,
            };
          } catch (uploadError) {
            console.warn(
              "Firebase upload failed, using local fallback:",
              uploadError
            );

            return {
              status: "local-fallback",
              name: file.name,
              url: localUrl,
              localFile: file,
              contentType: file.type,
            };
          }
        } catch (error) {
          console.error("Upload error:", error);
          return {
            status: "error",
            name: file.name,
            message: `Upload failed: ${error.message}`,
            error,
          };
        }
      };

      for (const file of files) {
        const result = await uploadImage(file);
        uploadResults.push(result);

        if (result.status === "success" || result.status === "local-fallback") {
          completedUploads++;

          setCurrentEvent((prev) => ({
            ...prev,
            images: [
              ...prev.images,
              {
                url: result.url,
                path: result.path || null,
                name: result.name,
                contentType: result.contentType,
                isLocalFallback: result.status === "local-fallback",
                localFile: result.localFile || null,
                uploadedAt: new Date().getTime(),
              },
            ],
          }));
        }
      }

      const successful = uploadResults.filter(
        (r) => r.status === "success"
      ).length;
      const fallbacks = uploadResults.filter(
        (r) => r.status === "local-fallback"
      ).length;
      const failed = uploadResults.filter((r) => r.status === "error").length;

      if (successful > 0) {
        setSuccessMessage(
          `Successfully uploaded ${successful} image${
            successful !== 1 ? "s" : ""
          } to Firebase Storage${
            fallbacks > 0 ? ` (${fallbacks} using temporary storage)` : ""
          }`
        );
      } else if (fallbacks > 0) {
        setSuccessMessage(
          `${fallbacks} image${
            fallbacks !== 1 ? "s" : ""
          } temporarily stored. Firebase Storage CORS issue detected - contact administrator.`
        );
      }

      if (failed > 0) {
        const errors = uploadResults
          .filter((r) => r.status === "error")
          .map((r) => `${r.name}: ${r.message}`)
          .join(", ");

        setErrorMessage(
          `Failed to upload ${failed} image${
            failed !== 1 ? "s" : ""
          }: ${errors}`
        );
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error in upload process:", error);

      let errorMsg = "Upload process failed. Please try again.";
      if (error.message && error.message.includes("CORS")) {
        errorMsg =
          "CORS policy error. Contact administrator to update Firebase Storage configuration.";
      } else if (error.code) {
        errorMsg = `Error code: ${error.code}. ${
          error.message || "Please try again."
        }`;
      }

      setErrorMessage(errorMsg);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleAddImageFromUrl = async () => {
    if (!imageUrl.trim()) {
      setUrlError("Please enter a valid URL");
      return;
    }

    setUrlError("");
    setIsAddingFromUrl(true);

    try {
      const urls = multipleUrls
        ? imageUrl
            .split("\n")
            .map((url) => url.trim())
            .filter((url) => url !== "")
        : [imageUrl.trim()];

      if (urls.length === 0) {
        setUrlError("No valid URLs found");
        setIsAddingFromUrl(false);
        return;
      }

      const addedImages = [];
      const failedUrls = [];

      for (const url of urls) {
        try {
          new URL(url);

          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () =>
              reject(new Error(`Cannot load image from: ${url}`));
            img.src = url;
          });

          addedImages.push({
            url: url,
            path: null,
            name: `url-image-${new Date().getTime()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            contentType: "image/url",
            isExternalUrl: true,
            uploadedAt: new Date().getTime(),
          });
        } catch (error) {
          console.error("Error with URL:", url, error);
          failedUrls.push(url);
        }
      }

      if (addedImages.length > 0) {
        setCurrentEvent((prev) => ({
          ...prev,
          images: [...prev.images, ...addedImages],
        }));

        setImageUrl("");
        setSuccessMessage(
          `Successfully added ${addedImages.length} image${
            addedImages.length !== 1 ? "s" : ""
          } from URL${addedImages.length !== 1 ? "s" : ""}`
        );
      }

      if (failedUrls.length > 0) {
        setUrlError(
          `Failed to load ${failedUrls.length} URL${
            failedUrls.length !== 1 ? "s" : ""
          }: ${failedUrls.join(", ")}`
        );
      }
    } catch (error) {
      console.error("Error adding image from URL:", error);
      setUrlError(error.message || "Failed to load image from URL");
    } finally {
      setIsAddingFromUrl(false);
    }
  };

  const handleRemoveImage = async (indexToRemove) => {
    try {
      const imageToRemove = currentEvent.images[indexToRemove];

      if (imageToRemove && imageToRemove.path) {
        const storageRef = ref(storage, imageToRemove.path);
        try {
          await deleteObject(storageRef);
        } catch (error) {
          console.error("Error deleting image from storage:", error);
        }
      }

      setCurrentEvent((prev) => ({
        ...prev,
        images: prev.images.filter((_, index) => index !== indexToRemove),
      }));

      if (currentImageIndex >= indexToRemove && currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1);
      } else if (currentEvent.images.length <= 1) {
        setCurrentImageIndex(0);
      }

      setSuccessMessage("Image removed successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      setErrorMessage("Failed to remove image. Please try again.");
    }
  };

  const handleNextImage = () => {
    if (currentEvent.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % currentEvent.images.length);
    }
  };

  const handlePrevImage = () => {
    if (currentEvent.images.length > 1) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + currentEvent.images.length) % currentEvent.images.length
      );
    }
  };

  const handleDeleteAllImages = async (images) => {
    if (!images || images.length === 0) return;

    for (const image of images) {
      if (image && image.path) {
        try {
          const storageRef = ref(storage, image.path);
          await deleteObject(storageRef);
        } catch (error) {
          console.error("Error deleting image from storage:", error);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentEvent.title || !currentEvent.date) {
      setErrorMessage("Title and date are required.");
      return;
    }

    if (currentEvent.images.length === 0) {
      setErrorMessage("At least one image is required.");
      return;
    }

    try {
      setIsLoading(true);

      const hasLocalImages = currentEvent.images.some(
        (img) => img.isLocalFallback
      );

      const eventData = {
        ...currentEvent,
        image: currentEvent.images[0]?.url || "",
        images: currentEvent.images.map((img) => ({
          url: img.url,
          path: img.path,
          name: img.name,
          contentType: img.contentType,
          isLocalFallback: img.isLocalFallback || false,
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (hasLocalImages) {
        console.warn(
          "Saving event with local images due to Firebase Storage CORS issues"
        );
      }

      if (isEditing && currentEvent.id) {
        const eventRef = doc(db, "events", currentEvent.id);
        await updateDoc(eventRef, {
          ...eventData,
          createdAt: currentEvent.createdAt,
        });
        setSuccessMessage(
          `Event "${currentEvent.title}" updated successfully!${
            hasLocalImages ? " (Note: Some images are stored locally)" : ""
          }`
        );
        await logEvent(`Event updated: ${currentEvent.title}`);
      } else {
        await addDoc(collection(db, "events"), eventData);
        setSuccessMessage(
          `Event "${currentEvent.title}" added successfully!${
            hasLocalImages ? " (Note: Some images are stored locally)" : ""
          }`
        );
        await logEvent(`Event created: ${currentEvent.title}`);
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      setErrorMessage("Failed to save event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (eventId, eventTitle, eventImages) => {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      return;
    }

    try {
      setIsLoading(true);

      await handleDeleteAllImages(eventImages);

      await deleteDoc(doc(db, "events", eventId));
      setSuccessMessage(`Event "${eventTitle}" deleted successfully!`);
      fetchEvents();
      await logEvent(`Event deleted: ${eventTitle}`);
    } catch (error) {
      console.error("Error deleting event:", error);
      setErrorMessage("Failed to delete event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (event) => {
    const eventWithImages = {
      ...event,
      images: event.images || (event.image ? [{ url: event.image }] : []),
    };

    setCurrentEvent(eventWithImages);
    setCurrentImageIndex(0);
    setIsEditing(true);
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setCurrentEvent({
      title: "",
      date: "",
      location: "",
      description: "",
      images: [],
      badge: "None",
      featured: false,
    });
    setCurrentImageIndex(0);
    setIsEditing(false);
    setShowForm(false);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Event Management</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className={`${
            showForm ? "bg-red-600" : "bg-green-600"
          } text-white px-4 py-2 rounded-lg shadow flex items-center`}
        >
          {showForm ? (
            <>
              <FaTimes className="mr-2" /> Cancel
            </>
          ) : (
            <>
              <FaPlus className="mr-2" /> Add New Event
            </>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded mb-6 flex items-center"
          >
            <span>✅</span>
            <span className="ml-2">{successMessage}</span>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6 flex items-center"
          >
            <span>❌</span>
            <span className="ml-2">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden mb-8"
          >
            <div className="bg-indigo-600 text-white p-4">
              <h3 className="text-xl font-semibold">
                {isEditing ? "Edit Event" : "Add New Event"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={currentEvent.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date*
                  </label>
                  <input
                    type="text"
                    name="date"
                    value={currentEvent.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., November 15, 2023"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: Month Day, Year (e.g., November 15, 2023)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={currentEvent.location}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Event location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Badge
                  </label>
                  <select
                    name="badge"
                    value={currentEvent.badge}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="None">None</option>
                    <option value="Featured">Featured</option>
                    <option value="Important">Important</option>
                    <option value="New">New</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Images*
                  </label>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                          disabled={uploadingImages}
                        />
                        <label
                          htmlFor="image-upload"
                          className={`flex items-center justify-center px-4 py-2 border ${
                            uploadingImages
                              ? "border-gray-300 bg-gray-100"
                              : "border-indigo-300 bg-indigo-50 hover:bg-indigo-100"
                          } rounded-md shadow-sm text-sm font-medium ${
                            uploadingImages
                              ? "text-gray-500 cursor-not-allowed"
                              : "text-indigo-700 cursor-pointer"
                          } transition-colors`}
                        >
                          {uploadingImages ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <FaUpload className="mr-2" />
                              <span>Upload Images</span>
                            </>
                          )}
                        </label>
                      </div>

                      <div className="text-sm text-gray-600">
                        {currentEvent.images.length > 0 ? (
                          <span>
                            {currentEvent.images.length} image(s) selected
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-600">
                            <FaExclamationTriangle className="mr-1" size={12} />
                            At least one image is required
                          </span>
                        )}

                        <div className="text-xs text-gray-500 mt-1">
                          Supports JPG, PNG, GIF (max 5MB per image)
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-md p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                        <span>Add Image from URL</span>
                        <label className="inline-flex items-center cursor-pointer text-xs font-normal">
                          <input
                            type="checkbox"
                            checked={multipleUrls}
                            onChange={() => setMultipleUrls(!multipleUrls)}
                            className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                          />
                          <span className="ml-2">Multiple URLs</span>
                        </label>
                      </h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex-grow">
                          {multipleUrls ? (
                            <textarea
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="Enter one image URL per line"
                              rows={3}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <input
                              type="text"
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="Enter image URL"
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          )}
                          {urlError && (
                            <p className="text-red-600 text-xs mt-1">
                              {urlError}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleAddImageFromUrl}
                          disabled={isAddingFromUrl || !imageUrl.trim()}
                          className={`px-4 py-2 ${
                            isAddingFromUrl || !imageUrl.trim()
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-indigo-600 text-white hover:bg-indigo-700"
                          } rounded-md flex items-center justify-center transition-colors w-full sm:w-auto`}
                        >
                          {isAddingFromUrl ? (
                            <FaSpinner className="animate-spin mr-1" />
                          ) : (
                            <FaLink className="mr-1" />
                          )}
                          {isAddingFromUrl
                            ? "Adding..."
                            : multipleUrls
                            ? "Add All URLs"
                            : "Add URL"}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {multipleUrls
                          ? "Enter one image URL per line. Each URL must directly link to an image."
                          : "Paste a direct link to an image (must be publicly accessible)."}
                      </p>
                    </div>

                    {currentEvent.images.length > 0 && (
                      <div className="border rounded-md p-4 bg-gray-50">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700">
                            Image Preview
                          </h4>
                          <span className="text-xs text-gray-500">
                            {currentImageIndex + 1} of{" "}
                            {currentEvent.images.length}
                          </span>
                        </div>

                        <div className="relative">
                          <div className="aspect-w-16 aspect-h-9 h-60 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                            {currentEvent.images.length > 0 ? (
                              <img
                                src={
                                  currentEvent.images[currentImageIndex]?.url
                                }
                                alt={`Preview ${currentImageIndex + 1}`}
                                className="max-h-60 max-w-full object-contain"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/400x300?text=Image+Error";
                                }}
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-gray-400">
                                <FaImage size={40} />
                                <p className="mt-2 text-sm">
                                  No images selected
                                </p>
                              </div>
                            )}
                          </div>

                          {currentEvent.images.length > 1 && (
                            <div className="absolute inset-y-0 flex items-center justify-between w-full px-2">
                              <button
                                type="button"
                                onClick={handlePrevImage}
                                className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                              >
                                <FaArrowLeft />
                              </button>
                              <button
                                type="button"
                                onClick={handleNextImage}
                                className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                              >
                                <FaArrowRight />
                              </button>
                            </div>
                          )}

                          {currentEvent.images.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveImage(currentImageIndex)
                              }
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                              title="Remove this image"
                            >
                              <FaTrash size={14} />
                            </button>
                          )}
                        </div>

                        {currentEvent.images.length > 1 && (
                          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                            {currentEvent.images.map((image, idx) => (
                              <div
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-16 h-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all
                        ${
                          currentImageIndex === idx
                            ? "border-indigo-500 shadow-md"
                            : "border-gray-200 hover:border-indigo-300"
                        }`}
                              >
                                <img
                                  src={image.url}
                                  alt={`Thumbnail ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/100?text=Error";
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {currentEvent.images.length > 0 && (
                          <div className="mt-2 text-xs text-indigo-600">
                            <span className="font-medium">
                              💡 The first image will be used as the cover image
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You can upload multiple images from your device or add them
                    from URLs.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={currentEvent.description}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter event description"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={currentEvent.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Feature this event (will appear in the carousel)
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
                >
                  <FaTimes className="mr-2" /> Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading || uploadingImages}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center ${
                    isLoading || uploadingImages
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <FaSave className="mr-2" />
                  {isLoading ? "Saving..." : "Save Event"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">All Events</h3>
        {isLoading && !showForm ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">
              No events found. Create your first event!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4">
                  <div className="h-48 md:h-auto bg-gray-100 relative">
                    {event.images && event.images.length > 0 ? (
                      <div className="w-full h-full">
                        <img
                          src={event.images[0].url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/300x200?text=No+Image";
                          }}
                        />
                        {event.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                            +{event.images.length - 1} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <FaImage className="text-gray-400 text-4xl" />
                      </div>
                    )}

                    {event.badge && event.badge !== "None" && (
                      <span
                        className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${
                          event.badge === "Featured"
                            ? "bg-indigo-600 text-white"
                            : event.badge === "Important"
                            ? "bg-blue-600 text-white"
                            : event.badge === "Urgent"
                            ? "bg-red-600 text-white"
                            : "bg-green-600 text-white"
                        }`}
                      >
                        {event.badge}
                      </span>
                    )}

                    {event.featured && (
                      <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="p-5 md:col-span-3">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center text-sm text-gray-600">
                            <FaCalendarAlt className="mr-1 text-indigo-600" />
                            {event.date}
                          </span>
                          {event.location && (
                            <span className="inline-flex items-center text-sm text-gray-600 ml-3">
                              🏫 {event.location}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {event.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(event)}
                        className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 flex items-center"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleDelete(event.id, event.title, event.images)
                        }
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                      >
                        <FaTrashAlt className="mr-1" /> Delete
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;
