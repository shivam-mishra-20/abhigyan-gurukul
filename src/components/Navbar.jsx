import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navbar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden z-3 lg:flex w-[full] relative py-7 items-center justify-center bg-[#6BC74C] h-[70px] overflow-hidden shadow-md"
      >
        <motion.img
          src="/Group236.svg"
          alt=""
          className="absolute z-2 mt-8 right-80 object-cover hidden lg:block"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        <div className="flex justify-evenly px-5 items-end w-1/3 h-full">
          <div className="flex h-full items-center">
            <a href="/">
              <motion.img
                src="/ABHIGYAN_GURUKUL_logo.svg"
                className="self-center h-[60px] w-[60px] rounded-full"
                alt=""
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </a>
          </div>

          <h1 className="text-white font-bold mb-1 text-xl">
            Abhigyan Gurukul
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="absolute -bottom-[2px] text-[#252641] bg-white border rounded-lg font-semibold px-14 border-white py-1 hidden lg:flex lg:left-[170px] 2xl:left-[250px]"
        >
          Never stop learning
        </motion.div>

        <div className="flex z-5 justify-center items-center sm:gap-18 gap-10 font-semibold text-black text-md w-1/2 h-full">
          {["Home", "About Us"].map((text, index) => (
            <motion.div
              key={text}
              whileHover={{ scale: 1.1, backgroundColor: "#0b707739" }}
              className="text-white text-center px-2 py-1 hover:rounded-xl font-semibold"
            >
              <Link to={text === "Home" ? "/" : "/about"}>{text}</Link>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-evenly px-5 items-center w-1/3 h-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-white ps-2 pe-6 lg:py-3 rounded-xl font-semibold bg-[#0B7077] hover:scale-105"
            onClick={() => (window.location.href = "/enrollnow")}
          >
            CONTACT US
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Navbar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="lg:hidden h-[93px] w-full relative bg-[#6BC74C]"
      >
        <div className="flex justify-between items-center p-5">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <motion.img
                src="/ABHIGYAN_GURUKUL_logo.svg"
                alt=""
                className="h-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              />
            </Link>
            <h1 className="text-white font-bold text-lg">Abhigyan Gurukul</h1>
          </div>
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
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
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-[#6BC74C] border-t border-[#5ab33f] pb-4 shadow-lg"
            >
              <div className="flex flex-col items-center gap-6 py-4 font-semibold text-black text-md">
                {["Home", "About Us"].map((text) => (
                  <motion.div
                    key={text}
                    whileTap={{ scale: 1.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Link
                      to={text === "Home" ? "/" : "/about"}
                      className="hover:text-[#0B7077] transition-all"
                    >
                      {text}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="flex flex-col space-y-3 px-5">
                <motion.button
                  whileTap={{ scale: 1.05 }}
                  whileHover={{ scale: 1.05, backgroundColor: "#e0e0e0" }}
                  className="text-[#0B7077] py-2 rounded-xl font-semibold bg-[#ffffffdf] transition-all"
                  onClick={() => (window.location.href = "/enrollnow")}
                >
                  CONTACT US
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default Navbar;
