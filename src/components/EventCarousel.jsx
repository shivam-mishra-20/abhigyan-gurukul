import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaRegCalendarCheck,
  FaExclamationCircle,
  FaArrowRight,
  FaExternalLinkAlt,
} from "react-icons/fa";
import EventDetailsModal from "./EventDetailsModal";

const EventCarousel = ({ maxEvents = 6 }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const autoplayRef = useRef(null);
  const [indexError, setIndexError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider({
    slides: {
      perView: () => {
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
      },
      spacing: 24,
      origin: "center",
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
    loop: true,
    renderMode: "performance",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log("Fetching events for carousel...");

        let querySnapshot;

        try {
          const featuredQuery = query(
            collection(db, "events"),
            where("featured", "==", true),
            orderBy("createdAt", "desc"),
            limit(maxEvents)
          );

          querySnapshot = await getDocs(featuredQuery);
          setIndexError(null);
        } catch (indexErr) {
          console.warn("Index error with featured query:", indexErr.message);

          if (indexErr.message && indexErr.message.includes("index")) {
            const indexUrlMatch = indexErr.message.match(
              /https:\/\/console\.firebase\.google\.com[^\s]+/
            );
            const indexUrl = indexUrlMatch ? indexUrlMatch[0] : null;

            setIndexError({
              message:
                "The events query requires a database index to be created.",
              url: indexUrl,
            });

            const simpleQuery = query(
              collection(db, "events"),
              orderBy("createdAt", "desc"),
              limit(maxEvents)
            );

            querySnapshot = await getDocs(simpleQuery);
          } else {
            throw indexErr;
          }
        }

        if (querySnapshot.empty) {
          console.log("No events found");
          setEvents([]);
          setLoading(false);
          return;
        }

        const fetchedEvents = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Event data:", doc.id, data);

          const processedImages = processEventImages(data, doc.id);

          return {
            id: doc.id,
            title: data.title || "Untitled Event",
            description: data.description || "No description provided",
            eventDate: data.eventDate || null,
            location: data.location || "TBA",
            date: data.date || null,
            imageUrl: processedImages.primaryImageUrl,
            images: processedImages.images,
            badge: data.badge !== "None" ? data.badge : null,
            featured: data.featured || false,
            createdBy: data.createdBy || "admin",
            createdAt: data.createdAt || null,
          };
        });

        console.log("Processed events for carousel:", fetchedEvents.length);
        setEvents(fetchedEvents);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load events:", err);
        setError(`Failed to load events: ${err.message}`);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [maxEvents]);

  const processEventImages = (eventData, docId) => {
    const defaultImage = "/event-placeholder.jpg";
    let processedImages = [];
    let primaryImageUrl = defaultImage;

    if (
      eventData.images &&
      Array.isArray(eventData.images) &&
      eventData.images.length > 0
    ) {
      processedImages = eventData.images.map((img, index) => {
        if (typeof img === "string") {
          return {
            id: `img-${docId}-${index}-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
            url: img,
            isDefault: false,
          };
        }

        if (img && typeof img === "object") {
          return {
            id:
              img.id ||
              `img-${docId}-${index}-${Math.random()
                .toString(36)
                .substring(2, 9)}`,
            url: img.url || defaultImage,
            path: img.path || null,
            isDefault: !img.url,
          };
        }

        return {
          id: `img-${docId}-fallback-${index}`,
          url: defaultImage,
          isDefault: true,
        };
      });

      processedImages = processedImages.filter((img) => img && img.url);

      if (processedImages.length > 0) {
        primaryImageUrl = processedImages[0].url;
      }
    } else if (eventData.image && typeof eventData.image === "string") {
      primaryImageUrl = eventData.image;
      processedImages = [
        {
          id: `img-${docId}-main`,
          url: eventData.image,
          isDefault: false,
        },
      ];
    } else {
      processedImages = [
        {
          id: `img-${docId}-default`,
          url: defaultImage,
          isDefault: true,
        },
      ];
    }

    return {
      images: processedImages,
      primaryImageUrl: primaryImageUrl,
    };
  };

  const getEventImageUrl = (event) => {
    if (
      event.images &&
      Array.isArray(event.images) &&
      event.images.length > 0
    ) {
      const firstImage = event.images[0];
      return typeof firstImage === "object" ? firstImage.url : firstImage;
    }
    if (event.imageUrl) {
      return event.imageUrl;
    }
    return "/event-placeholder.jpg";
  };

  useEffect(() => {
    if (autoplay && loaded && instanceRef.current && events.length > 1) {
      autoplayRef.current = setInterval(() => {
        if (instanceRef.current) {
          instanceRef.current.next();
        }
      }, 2500);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [autoplay, loaded, events.length]);

  const pauseAutoplay = () => {
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "TBA";
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (typeof timestamp === "object" && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
      } else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else {
        date = new Date(timestamp);
      }

      return date instanceof Date && !isNaN(date)
        ? date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "TBA";
    } catch {
      return "TBA";
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "TBA";
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (typeof timestamp === "object" && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
      } else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else {
        date = new Date(timestamp);
      }

      return date instanceof Date && !isNaN(date)
        ? date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "TBA";
    } catch {
      return "TBA";
    }
  };

  const displayDate = (event) => {
    if (event.date) return event.date;
    if (event.formattedDate) return event.formattedDate;
    if (event.eventDate) {
      return formatDate(event.eventDate);
    }
    return "TBA";
  };

  const displayTime = (event) => {
    if (event.time) return event.time;
    if (event.eventDate) {
      return formatTime(event.eventDate);
    }
    return "TBA";
  };

  const displayLocation = (event) => {
    return event.location || event.venue || "TBA";
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
    setAutoplay(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setTimeout(() => setAutoplay(true), 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-yellow-50 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

      <div className="container mx-auto px-4 md:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <FaRegCalendarCheck className="text-green-600 text-2xl mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
              Upcoming Events
            </h2>
          </div>
          <div className="w-24 h-1.5 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Join us for these exciting events and activities at Abhigyan Gurukul
          </p>
        </motion.div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"
            ></motion.div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 text-red-700 p-4 rounded-lg text-center mb-6 flex items-center justify-center"
          >
            <FaExclamationCircle className="mr-2" />
            {error}
          </motion.div>
        )}

        {!loading && !error && events.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <img
              src="/no-events.svg"
              alt="No events"
              className="w-32 h-32 mx-auto mb-4 opacity-50"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <p className="text-xl text-gray-500">
              No upcoming events at the moment.
            </p>
            <p className="text-gray-400">
              Check back soon for new announcements!
            </p>
          </motion.div>
        )}

        {!loading && !error && events.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative"
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
          >
            <div ref={sliderRef} className="keen-slider pb-16 py-5">
              {events.map((event, idx) => (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  className={`keen-slider__slide px-1.5 pt-2 ${
                    currentSlide === idx ? "z-10" : "z-0"
                  }`}
                >
                  <motion.div
                    whileHover={{
                      y: -8,
                      boxShadow: "0 20px 30px rgba(0, 0, 0, 0.12)",
                    }}
                    animate={{
                      scale: currentSlide === idx ? 1.05 : 0.95,
                      opacity: currentSlide === idx ? 1 : 0.8,
                      y: currentSlide === idx ? -5 : 0,
                    }}
                    transition={{ duration: 0.4 }}
                    className={`bg-white rounded-xl overflow-hidden shadow-md h-full border flex flex-col 
                      ${
                        currentSlide === idx
                          ? "border-green-400 ring-1 ring-green-200 shadow-xl"
                          : "border-gray-100"
                      }`}
                  >
                    {currentSlide === idx && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-green-500 rounded-full"></div>
                    )}

                    <div className="relative h-52 overflow-hidden">
                      <motion.img
                        src={getEventImageUrl(event)}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Image failed to load:", e.target.src);
                          e.target.src = "/event-placeholder.jpg";
                          if (!e.target.src.includes("event-placeholder")) {
                            e.target.src = "/event-placeholder.jpg";
                          }
                        }}
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-100">
                        <div className="text-sm font-medium text-green-700">
                          {event.date ||
                            (event.eventDate
                              ? formatDate(event.eventDate).split(",")[0]
                              : "TBA")}
                        </div>
                      </div>
                      {event.badge && (
                        <div className="absolute top-4 left-4 bg-green-600 bg-opacity-90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
                          <div className="text-xs font-semibold text-white uppercase tracking-wide">
                            {event.badge}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 leading-tight">
                        {event.title}
                      </h3>

                      <p className="text-gray-600 mb-5 line-clamp-3 text-sm flex-1 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="space-y-3 mb-5">
                        <div className="flex items-start text-sm text-gray-500">
                          <FaCalendarAlt className="text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="leading-tight">
                            {displayDate(event)}
                          </span>
                        </div>
                        <div className="flex items-start text-sm text-gray-500">
                          <FaClock className="text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="leading-tight">
                            {displayTime(event)}
                          </span>
                        </div>
                        {(event.location || event.venue) && (
                          <div className="flex items-start text-sm text-gray-500">
                            <FaMapMarkerAlt className="text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2 leading-tight">
                              {displayLocation(event)}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleEventClick(event)}
                        className="mt-auto inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-sm"
                      >
                        View Details
                        <FaArrowRight className="ml-2.5 text-sm" />
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {loaded && instanceRef.current && events.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.15, backgroundColor: "#16a34a" }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-3 bg-white text-green-600 p-3.5 rounded-full shadow-lg z-10 hover:text-white transition-colors duration-300 border border-gray-100"
                  onClick={() => {
                    instanceRef.current?.prev();
                    pauseAutoplay();
                  }}
                >
                  <FaChevronLeft />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.15, backgroundColor: "#16a34a" }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-3 bg-white text-green-600 p-3.5 rounded-full shadow-lg z-10 hover:text-white transition-colors duration-300 border border-gray-100"
                  onClick={() => {
                    instanceRef.current?.next();
                    pauseAutoplay();
                  }}
                >
                  <FaChevronRight />
                </motion.button>
              </>
            )}

            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              <div
                className={`w-2 h-2 rounded-full ${
                  autoplay
                    ? "bg-green-500 animate-[pulse_1.5s_ease-in-out_infinite]"
                    : "bg-gray-300"
                }`}
              ></div>
            </div>

            {loaded && instanceRef.current && (
              <div className="flex justify-center mt-1">
                {Array.from({
                  length: instanceRef.current.track.details.slides.length,
                }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      instanceRef.current?.moveToIdx(idx);
                      pauseAutoplay();
                    }}
                    className={`mx-1 h-2.5 transition-all ease-out duration-300 ${
                      currentSlide === idx
                        ? "bg-green-600 w-8 rounded-full"
                        : "bg-gray-300 hover:bg-gray-400 w-2.5 rounded-full"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  ></button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {!loading && !error && events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center mt-5"
          >
            <button
              onClick={() => (window.location.href = "/events")}
              className="inline-flex items-center px-7 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 text-lg"
            >
              View All Events
              <svg
                className="w-5 h-5 ml-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={closeModal}
            isOpen={isModalOpen}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default EventCarousel;
