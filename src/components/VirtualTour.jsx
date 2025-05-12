import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaTimes,
  FaStreetView,
  FaSchool,
  FaBookReader,
  FaFlask,
  FaRunning,
} from "react-icons/fa";
import { MdSportsTennis, MdComputer, MdOutlineScience } from "react-icons/md";
import { BsBuilding, BsImages } from "react-icons/bs";

// Enhanced TourTab with better animations and styling
const TourTab = ({ section, isActive, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`flex items-center px-4 py-3 rounded-full font-medium shadow-sm transition-all ${
      isActive
        ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md"
        : "bg-white text-gray-700 border border-gray-200 hover:bg-green-50"
    }`}
    onClick={onClick}
  >
    <span className="mr-2 text-xl">{section.icon}</span>
    <span className="hidden sm:inline">{section.title}</span>
  </motion.button>
);

// Enhanced MediaCard with better visuals and animations
const MediaCard = ({ item, index, openModal }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.15 }}
    className={`relative rounded-xl overflow-hidden shadow-xl h-full transform transition-transform hover:scale-[1.02] ${
      index === 0 ? "col-span-2 row-span-2" : ""
    }`}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 transition-opacity"></div>
    <img
      src={item.type === "video" ? item.thumbnail : item.src}
      alt={item.title}
      className="w-full h-full object-cover"
      loading="lazy"
    />

    <div className="absolute inset-0 flex flex-col justify-end p-4">
      <p className="text-white font-semibold mb-2 text-sm sm:text-base drop-shadow-lg">
        {item.title}
      </p>

      {item.type === "video" && (
        <motion.button
          whileHover={{
            scale: 1.1,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/85 text-green-600 rounded-full p-4 sm:p-6 shadow-lg backdrop-blur-sm"
          onClick={() => openModal(item)}
          aria-label={`Play ${item.title}`}
        >
          <FaPlay className="text-lg sm:text-2xl ml-1" />
        </motion.button>
      )}

      {item.type === "image" && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white/90 text-green-600 py-2 px-4 rounded-lg font-medium text-sm sm:text-base shadow-md hover:bg-white"
          onClick={() => openModal(item)}
          aria-label={`View ${item.title}`}
        >
          View Fullscreen
        </motion.button>
      )}
    </div>
  </motion.div>
);

const FeatureItem = ({ icon, title, description }) => (
  <div className="flex items-start">
    <div className="bg-green-50 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 text-green-600 shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
        {title}
      </h4>
      <p className="text-gray-600 text-xs sm:text-sm">{description}</p>
    </div>
  </div>
);

const FacilityCard = ({ icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 + 0.3 }}
    className="bg-white p-5 sm:p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow"
  >
    <div className="bg-green-50 p-3 sm:p-4 inline-flex rounded-xl text-green-600 mb-3 sm:mb-4">
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm sm:text-base">{description}</p>
  </motion.div>
);

// Enhanced MediaModal with better video player and loading states
const MediaModal = ({ isOpen, closeModal, currentMedia }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, type: "spring", damping: 20 }}
            className="relative w-full max-w-6xl bg-transparent rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {currentMedia.type === "video" && (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
                  </div>
                )}
                <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg shadow-2xl overflow-hidden">
                  <iframe
                    ref={videoRef}
                    className="w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${currentMedia.id}?autoplay=1&rel=0&modestbranding=1&showinfo=0&fs=1&color=white`}
                    title={currentMedia.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    onLoad={handleVideoLoad}
                  ></iframe>
                </div>
              </>
            )}

            {currentMedia.type === "image" && (
              <img
                src={currentMedia.src}
                alt={currentMedia.alt || currentMedia.title}
                className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 sm:p-5"
            >
              <h3 className="text-white text-lg sm:text-xl font-medium drop-shadow">
                {currentMedia.title}
              </h3>
            </motion.div>

            <button
              className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 rounded-full p-3 sm:p-4 text-white transition-colors shadow-lg"
              onClick={closeModal}
              aria-label="Close media"
            >
              <FaTimes className="text-lg sm:text-xl" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const VirtualTour = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentMedia, setCurrentMedia] = useState({
    type: "video",
    id: "TvNB4fHYJs4",
    title: "Campus Overview",
  });

  // Updated tour sections with high-quality video IDs and better thumbnails
  const tourSections = [
    {
      id: "overview",
      title: "Campus Overview",
      icon: <FaSchool />,
      description:
        "Experience our entire campus facilities and environment in this comprehensive tour.",
      media: [
        {
          type: "video",
          id: "jfKfPfyJRdk", // Lofi beats - higher quality example
          title: "Campus Overview Tour",
          thumbnail:
            "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1470&auto=format&fit=crop",
        },
        {
          type: "image",
          src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1471&auto=format&fit=crop",
          title: "Main Campus Building",
          alt: "Abhigyan Gurukul Main Building",
        },
      ],
    },
    {
      id: "classrooms",
      title: "Classrooms",
      icon: <FaBookReader />,
      description:
        "Explore our modern, tech-enabled classrooms designed for interactive learning.",
      media: [
        {
          type: "video",
          id: "5qap5aO4i9A", // Lofi beats - higher quality example
          title: "Classroom Facilities",
          thumbnail:
            "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1472&auto=format&fit=crop",
        },
        {
          type: "image",
          src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1470&auto=format&fit=crop",
          title: "Smart Classroom",
          alt: "Abhigyan Gurukul Smart Classroom",
        },
      ],
    },
    {
      id: "labs",
      title: "Laboratories",
      icon: <MdOutlineScience />,
      description:
        "Take a tour of our state-of-the-art science, computer and language laboratories.",
      media: [
        {
          type: "video",
          id: "lTRiuFIWV54", // Lofi beats - higher quality example
          title: "Science Labs Tour",
          thumbnail:
            "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1470&auto=format&fit=crop",
        },
        {
          type: "image",
          src: "https://images.unsplash.com/photo-1581094488379-6a20e814c80e?q=80&w=1470&auto=format&fit=crop",
          title: "Computer Lab",
          alt: "Abhigyan Gurukul Computer Laboratory",
        },
      ],
    },
    {
      id: "sports",
      title: "Sports Facilities",
      icon: <MdSportsTennis />,
      description:
        "View our sports grounds, indoor facilities, and recreational areas.",
      media: [
        {
          type: "video",
          id: "n61ULEU7CO0", // Lofi beats - higher quality example
          title: "Sports Facilities Tour",
          thumbnail:
            "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1470&auto=format&fit=crop",
        },
        {
          type: "image",
          src: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1470&auto=format&fit=crop",
          title: "Sports Ground",
          alt: "Abhigyan Gurukul Sports Ground",
        },
      ],
    },
  ];

  const openModal = (media) => {
    setCurrentMedia(media);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const activeSection = tourSections.find(
    (section) => section.id === activeTab
  );

  return (
    <section className="py-12 sm:py-20 bg-gradient-to-b from-gray-100 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
            Explore Our Campus
          </h2>
          <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto mt-4 sm:mt-5 rounded-full"></div>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4 sm:mt-6 text-base sm:text-lg px-4">
            Take a comprehensive virtual tour of Abhigyan Gurukul's campus and
            experience our world-class facilities from anywhere.
          </p>
        </motion.div>

        {/* Tour Navigation Tabs - Enhanced Scrollable Design */}
        <div className="flex overflow-x-auto pb-3 hide-scrollbar mb-10 sm:mb-14 justify-start sm:justify-center gap-2 sm:gap-3 px-1">
          {tourSections.map((section) => (
            <TourTab
              key={section.id}
              section={section}
              isActive={activeTab === section.id}
              onClick={() => setActiveTab(section.id)}
            />
          ))}
        </div>

        {/* Active Section Content - Enhanced Layout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center mb-16 sm:mb-20">
              <div className="space-y-5 sm:space-y-6 order-2 md:order-1">
                <div className="inline-block p-3 sm:p-4 bg-green-100 rounded-xl text-green-600 mb-2">
                  {activeSection.icon}
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                  {activeSection.title}
                </h3>

                <p className="text-gray-600 text-base sm:text-lg">
                  {activeSection.description}
                </p>

                <div className="space-y-4 sm:space-y-5 mt-4">
                  <FeatureItem
                    icon={<FaStreetView size={18} />}
                    title="Interactive Experience"
                    description="Navigate through our facilities with 360° views"
                  />
                  <FeatureItem
                    icon={<BsImages size={18} />}
                    title="Comprehensive Gallery"
                    description="High-quality images and videos of our facilities"
                  />
                </div>
              </div>

              {/* Enhanced Media Gallery */}
              <div className="grid grid-cols-2 gap-4 sm:gap-5 order-1 md:order-2 h-full">
                {activeSection.media.map((item, index) => (
                  <MediaCard
                    key={index}
                    item={item}
                    index={index}
                    openModal={openModal}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Featured Areas - Enhanced cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
          {[
            {
              icon: <MdComputer size={24} />,
              title: "Computer Labs",
              description:
                "Modern computer labs with the latest hardware and software",
            },
            {
              icon: <FaFlask size={24} />,
              title: "Science Labs",
              description:
                "Well-equipped science laboratories for hands-on learning",
            },
            {
              icon: <FaRunning size={24} />,
              title: "Sports Facilities",
              description:
                "Indoor and outdoor sports facilities for all-round development",
            },
          ].map((facility, index) => (
            <FacilityCard
              key={index}
              icon={facility.icon}
              title={facility.title}
              description={facility.description}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Media Modal with better video player */}
      <MediaModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        currentMedia={currentMedia}
      />

      {/* Custom CSS */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default VirtualTour;
