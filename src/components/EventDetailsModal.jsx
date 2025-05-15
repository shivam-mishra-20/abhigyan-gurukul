import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
  FaExternalLinkAlt,
  FaShare,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const EventDetailsModal = ({ event, onClose, isOpen }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const modalRef = useRef();
  const imageViewerRef = useRef();

  // For keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isImageViewerOpen) {
          setIsImageViewerOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft") {
        if (isImageViewerOpen && event.images?.length > 1) {
          handlePrevImage();
        }
      } else if (e.key === "ArrowRight") {
        if (isImageViewerOpen && event.images?.length > 1) {
          handleNextImage();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isImageViewerOpen, onClose, event]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isImageViewerOpen &&
        imageViewerRef.current &&
        !imageViewerRef.current.contains(e.target)
      ) {
        setIsImageViewerOpen(false);
      } else if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isImageViewerOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleNextImage = () => {
    if (event.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
    }
  };

  const handlePrevImage = () => {
    if (event.images?.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + event.images.length) % event.images.length
      );
    }
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const formatDate = (date) => {
    if (!date) return "TBA";
    return date;
  };

  const formatTime = (time) => {
    if (!time) return "TBA";
    return time;
  };

  const formatLocation = (location) => {
    return location || "TBA";
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href);
        alert("Event link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const ModalBackdrop = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 z-50 backdrop-blur-sm flex justify-center items-center p-4 md:p-6"
      onClick={onClose}
    />
  );

  // Modal content animation
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Image gallery animation
  const imageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      <ModalBackdrop />

      {/* Main Modal */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          variants={modalVariants}
          ref={modalRef}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 md:p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 bg-white hover:bg-gray-300 rounded-full p-2 transition-all duration-200 shadow-md"
              aria-label="Close modal"
            >
              <FaTimes className="text-red-700" />
            </button>

            {event.badge && (
              <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                {event.badge}
              </span>
            )}

            <h2 className="text-2xl md:text-3xl font-bold pr-8">
              {event.title}
            </h2>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Images */}
              <div>
                <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-2">
                  <div className="aspect-w-16 aspect-h-9">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={`image-${currentImageIndex}`}
                        variants={imageVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        src={
                          event.images?.[currentImageIndex]?.url ||
                          event.imageUrl ||
                          "/event-placeholder.jpg"
                        }
                        alt={`${event.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setIsImageViewerOpen(true)}
                        onError={(e) => {
                          e.target.src = "/event-placeholder.jpg";
                        }}
                      />
                    </AnimatePresence>
                  </div>

                  {event.images?.length > 1 && (
                    <>
                      <button
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-green-50 transition-colors"
                        onClick={handlePrevImage}
                        aria-label="Previous image"
                      >
                        <FaChevronLeft className="text-green-600" />
                      </button>
                      <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-green-50 transition-colors"
                        onClick={handleNextImage}
                        aria-label="Next image"
                      >
                        <FaChevronRight className="text-green-600" />
                      </button>
                    </>
                  )}

                  {event.images?.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-3 py-1 rounded-full text-white text-xs">
                      {currentImageIndex + 1} / {event.images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {event.images?.length > 1 && (
                  <div className="flex overflow-x-auto space-x-2 pb-2 mt-2 hide-scrollbar">
                    {event.images.map((image, index) => (
                      <div
                        key={image.id || index}
                        className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                          currentImageIndex === index
                            ? "border-green-500 shadow"
                            : "border-transparent"
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img
                          src={image.url}
                          alt={`${event.title} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/event-placeholder.jpg";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Details */}
              <div>
                <div className="space-y-5">
                  {/* Event details */}
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FaCalendarAlt className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Date</p>
                        <p className="text-gray-600">
                          {formatDate(event.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FaClock className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Time</p>
                        <p className="text-gray-600">
                          {formatTime(event.time)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Location</p>
                        <p className="text-gray-600">
                          {formatLocation(event.location)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <hr className="border-gray-200" />

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      About This Event
                    </h3>
                    <div className="prose prose-green max-w-none text-gray-600">
                      <p>{event.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex justify-between items-center bg-gray-50">
            <div>
              {event.featured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Featured Event
                </span>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaShare className="mr-1.5" />
                Share
              </button>

              <button
                onClick={() => (window.location.href = `/events`)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Event Page <FaExternalLinkAlt className="ml-1.5" size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {isImageViewerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[60] flex items-center justify-center"
            >
              <button
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-colors z-[70]"
                onClick={() => setIsImageViewerOpen(false)}
                aria-label="Close fullscreen"
              >
                <FaTimes size={18} />
              </button>

              <div
                ref={imageViewerRef}
                className="relative w-full h-full flex items-center justify-center"
              >
                <motion.img
                  key={`fullscreen-${currentImageIndex}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  src={
                    event.images?.[currentImageIndex]?.url ||
                    event.imageUrl ||
                    "/event-placeholder.jpg"
                  }
                  alt={`${event.title} - Image ${currentImageIndex + 1}`}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                  onError={(e) => {
                    e.target.src = "/event-placeholder.jpg";
                  }}
                />

                {event.images?.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 text-white bg-black bg-opacity-50 rounded-full p-4 hover:bg-opacity-70 transition-colors"
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                    >
                      <FaArrowLeft size={20} />
                    </button>
                    <button
                      className="absolute right-4 text-white bg-black bg-opacity-50 rounded-full p-4 hover:bg-opacity-70 transition-colors"
                      onClick={handleNextImage}
                      aria-label="Next image"
                    >
                      <FaArrowRight size={20} />
                    </button>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded-full text-white">
                      {currentImageIndex + 1} / {event.images.length}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default EventDetailsModal;
