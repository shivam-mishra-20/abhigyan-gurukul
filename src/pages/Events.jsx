import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaFilter,
  FaSearch,
  FaArrowRight,
} from "react-icons/fa";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const eventsQuery = query(
          collection(db, "events"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(eventsQuery);

        if (snapshot.empty) {
          setEvents([]);
          setFilteredEvents([]);
        } else {
          const eventsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setEvents(eventsList);
          setFilteredEvents(eventsList);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...events];

    // Apply badge filter
    if (filter !== "all") {
      result = result.filter((event) => event.badge === filter);
    }

    // Apply search
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.description?.toLowerCase().includes(term) ||
          event.location?.toLowerCase().includes(term)
      );
    }

    setFilteredEvents(result);
  }, [filter, searchTerm, events]);

  // Get unique badge types for filter dropdown
  const badgeTypes = [
    "all",
    ...new Set(
      events
        .map((event) => event.badge)
        .filter((badge) => badge && badge !== "None")
    ),
  ];

  const badgeColors = {
    Featured: "bg-indigo-600",
    Urgent: "bg-rose-600",
    Important: "bg-blue-600",
    New: "bg-green-600",
    None: "hidden",
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-20 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Events & Announcements
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="h-1 bg-green-600 mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600"
          >
            Stay updated with all the latest happenings, news, and upcoming
            events at our institution
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-5xl mx-auto mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  {badgeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all" ? "All Events" : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-lg text-gray-700">
              Loading events...
            </span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              No events found
            </h3>
            <p className="text-gray-600">
              {searchTerm || filter !== "all"
                ? "Try adjusting your filter or search term."
                : "There are no upcoming events at this time. Check back later!"}
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    id={event.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden flex flex-col"
                  >
                    {/* Event Image */}
                    <div className="relative h-48 sm:h-64 bg-gray-200">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/800x400?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400 text-lg">
                            No image available
                          </span>
                        </div>
                      )}

                      {/* Badge */}
                      {event.badge && event.badge !== "None" && (
                        <span
                          className={`absolute top-4 left-4 ${
                            badgeColors[event.badge] || "bg-gray-600"
                          } text-white text-xs font-semibold px-2.5 py-1 rounded-full`}
                        >
                          {event.badge}
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex-grow flex flex-col">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {event.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1 text-indigo-600" />
                          {event.date}
                        </div>
                        {event.location && (
                          <div className="flex items-center ml-4">
                            <FaMapMarkerAlt className="mr-1 text-indigo-600" />
                            {event.location}
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 mb-4 flex-grow">
                        {event.description
                          ? event.description.length > 150
                            ? `${event.description.substring(0, 150)}...`
                            : event.description
                          : "No description available."}
                      </p>

                      <div className="mt-auto">
                        <button
                          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                          onClick={() => {
                            // You can implement a modal or a separate view for event details here
                            alert(`Event details for: ${event.title}`);
                          }}
                        >
                          View Details
                          <FaArrowRight className="ml-2" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
