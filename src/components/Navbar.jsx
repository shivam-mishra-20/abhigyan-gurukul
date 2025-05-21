import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";

// Custom event name for auth state changes
const AUTH_STATE_CHANGE_EVENT = "authStateChange";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollY } = useScroll();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");

  // Function to check authentication status
  const checkAuth = () => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    const name = localStorage.getItem("studentName");

    setIsAuthenticated(authStatus && name);
    setUserName(name || "");
  };

  // Check authentication status on mount and when storage changes
  useEffect(() => {
    checkAuth();

    // Listen for storage events to detect login/logout from other tabs
    window.addEventListener("storage", checkAuth);

    // Listen for our custom auth state change event
    window.addEventListener(AUTH_STATE_CHANGE_EVENT, checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, checkAuth);
    };
  }, []);

  // Track scroll direction for mobile navbar
  useEffect(() => {
    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? "down" : "up";

      if (
        direction !== scrollDirection &&
        (currentScrollY - lastScrollY > 10 ||
          currentScrollY - lastScrollY < -10)
      ) {
        setScrollDirection(direction);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", updateScrollDirection);

    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
    };
  }, [scrollDirection, lastScrollY]);

  // Close mobile menu when scrolling down
  useEffect(() => {
    if (scrollDirection === "down" && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [scrollDirection, isMenuOpen]);

  // Link animation variants
  const linkVariants = {
    hover: {
      scale: 1.1,
      color: "#ffffff",
      textShadow: "0px 0px 8px rgba(255,255,255,0.5)",
      transition: { type: "spring", stiffness: 300 },
    },
    tap: { scale: 0.95 },
  };

  // Button animation variants
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
      backgroundColor: "#096069",
      transition: { type: "spring", stiffness: 500 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <>
      {/* Desktop Navbar - FIXED: Now scrolls with page */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex w-full relative py-7 items-center justify-center bg-gradient-to-r from-[#5ab348] to-[#6BC74C] h-[70px] overflow-hidden shadow-lg z-10"
      >
        {/* Background decorative elements */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full z-0"
          style={{ x: 100, y: -150 }}
          animate={{
            x: [100, 110, 100],
            y: [-150, -140, -150],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut",
          }}
        />

        <motion.img
          src="/Group236.svg"
          alt=""
          className="absolute mt-8 right-80 object-cover hidden lg:block z-0"
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
        />

        {/* Logo and Title Section */}
        <div className="flex justify-evenly px-5 items-end w-1/3 h-full relative z-10">
          <div className="flex h-full items-center">
            <a href="/">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.08, rotate: 5 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <motion.img
                  src="/ABHIGYAN_GURUKUL_logo.svg"
                  className="self-center h-[60px] w-[60px] rounded-full shadow-md"
                  alt="Abhigyan Gurukul Logo"
                  initial={{ opacity: 0, rotate: -10 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </motion.div>
            </a>
          </div>

          <motion.h1
            className="text-white font-bold mb-1 text-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Abhigyan Gurukul
          </motion.h1>
        </div>

        {/* Tagline with enhanced animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="absolute -bottom-[2px] text-[#252641] bg-white border rounded-lg font-semibold px-14 border-white py-1 hidden lg:flex lg:left-[100px] 2xl:left-[160px] shadow-md z-20"
          whileHover={{
            y: -2,
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
            backgroundColor: "#f8f9fa",
          }}
        >
          <span className="mr-1">✨</span> Never stop learning
        </motion.div>

        {/* Navigation Links */}
        <div className="flex justify-center items-center gap-4 lg:gap-6 xl:gap-8 font-semibold text-black text-md w-2/3 h-full relative z-10">
          {[
            "Home",
            "About Us",
            "Faculties",
            "Admissions",
            // "Courses",
            // "Events",
          ].map((text, i) => (
            <motion.div
              key={text}
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
              className="text-white text-center px-2 py-2 hover:rounded-xl font-semibold relative"
            >
              <Link
                to={
                  text === "Home"
                    ? "/"
                    : text === "About Us"
                    ? "/about"
                    : text === "Faculties"
                    ? "/faculties"
                    : text === "Admissions"
                    ? "/admissions"
                    : text === "Courses"
                    ? "/courses"
                    : "/events"
                }
                className="relative z-10"
              >
                {text}
              </Link>
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end px-5 items-center w-1/3 h-full gap-3 relative z-10">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-white w-[130px] h-[42px] rounded-xl font-semibold bg-[#0B7077] hover:bg-[#314f51] transition-all duration-300 shadow-md"
            onClick={() => (window.location.href = "/enrollnow")}
          >
            CONTACT US
          </motion.button>

          {isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => (window.location.href = "/student-dashboard")}
              className="flex items-center gap-2 bg-[#0B7077] text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-[#314f51] transition-all duration-300 shadow-md"
            >
              <FaUserCircle className="text-xl" />
              <span className="font-semibold truncate max-w-[100px]">
                {userName}
              </span>
            </motion.div>
          ) : (
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="text-white w-[130px] h-[42px] rounded-xl font-semibold bg-[#0B7077] hover:bg-[#314f51] transition-all duration-300 shadow-md"
              onClick={() => (window.location.href = "/login")}
            >
              LOGIN
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Mobile Navbar - FIXED: Now has proper stacking with dashboard content */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: 1,
          y: scrollDirection === "down" && !isMenuOpen ? -93 : 0,
        }}
        transition={{ duration: 0.4 }}
        className="lg:hidden sticky top-0 left-0 right-0 z-20 h-[93px] w-full bg-gradient-to-r from-[#5ab348] to-[#6BC74C] shadow-lg"
      >
        {/* Background decor for mobile */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full"
            style={{ x: 20, y: -40 }}
            animate={{
              x: [20, 30, 20],
              y: [-40, -30, -40],
            }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="flex justify-between items-center p-5 relative z-10">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <motion.div whileTap={{ scale: 0.95 }} className="relative">
                <motion.img
                  src="/ABHIGYAN_GURUKUL_logo.svg"
                  alt=""
                  className="h-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                />
                <motion.div
                  className="absolute -bottom-1 -right-1 w-2 h-2 bg-white rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </Link>
            <motion.h1
              className="text-white font-bold text-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              Abhigyan Gurukul
            </motion.h1>
          </div>

          {/* Enhanced hamburger button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none p-2 rounded-full relative z-20"
            whileHover={{
              scale: 1.1,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? (
              <motion.svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                initial={{ rotate: 0 }}
                animate={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </motion.svg>
            ) : (
              <motion.svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </motion.svg>
            )}
          </motion.button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-gradient-to-b from-[#6BC74C] to-[#5ab348] border-t border-[#5ab33f] pb-6 shadow-lg overflow-hidden relative z-10"
            >
              {/* Background decoration for mobile menu */}
              <div className="absolute inset-0 overflow-hidden z-0">
                <motion.div
                  className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full"
                  animate={{
                    x: [0, 10, 0],
                    y: [0, -5, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                  }}
                />
              </div>

              <div className="flex flex-col items-center gap-4 py-4 font-semibold text-white text-md px-5 relative z-10">
                {[
                  "Home",
                  "About Us",
                  "Faculties",
                  "Admissions",
                  // "Courses",
                  // "Events",
                ].map((text, i) => (
                  <motion.div
                    key={text}
                    className="w-full"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      to={
                        text === "Home"
                          ? "/"
                          : text === "About Us"
                          ? "/about"
                          : text === "Faculties"
                          ? "/faculties"
                          : text === "Admissions"
                          ? "/admissions"
                          : text === "Courses"
                          ? "/courses"
                          : "/events"
                      }
                      className="block py-2 px-4 w-full text-center rounded-lg hover:bg-white hover:bg-opacity-20 transition-all relative z-10"
                    >
                      {text}
                    </Link>
                  </motion.div>
                ))}

                {/* Action buttons with enhanced styling */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full h-[42px] bg-[#0B7077] text-white rounded-xl font-semibold shadow-md mt-2 relative z-10"
                  onClick={() => (window.location.href = "/enrollnow")}
                >
                  CONTACT US
                </motion.button>

                {isAuthenticated ? (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full h-[42px] bg-[#0B7077] text-white rounded-xl font-semibold shadow-md relative z-10 flex items-center justify-center gap-2"
                    onClick={() =>
                      (window.location.href = "/student-dashboard")
                    }
                  >
                    <FaUserCircle className="text-lg" />
                    <span>{userName}</span>
                  </motion.button>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full h-[42px] bg-[#0B7077] text-white rounded-xl font-semibold shadow-md relative z-10"
                    onClick={() => (window.location.href = "/login")}
                  >
                    LOGIN
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default Navbar;

// Export the auth event name for other components to use
export const notifyAuthStateChange = () => {
  window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
};
