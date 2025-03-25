import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden z-3 lg:flex w-[full]  relative py-7 items-center justify-center bg-[#6BC74C] h-[70px] overflow-hidden">
        <img
          src="/Group236.svg"
          alt=""
          className="absolute z-2 mt-8  right-80  object-cover hidden lg:block"
        />
        <div className="flex justify-evenly px-5 items-end w-1/3 h-full">
          <div className="flex h-full items-center">
            <a href="/">
              <img
                src="/ABHIGYAN_GURUKUL_logo.svg"
                className="self-center h-[60px] w-[60px] rounded-full"
                alt=""
              />
            </a>
          </div>

          <h1 className="text-white font-bold mb-1 text-xl">
            Abhigyan Gurukul
          </h1>
        </div>
        <div className="absolute  -bottom-[2px]  text-[#252641] bg-white border rounded-lg font-semibold px-14 border-white  py-1  hidden lg:flex lg:left-[170px] 2xl:left-[250px] ">
          Never stop learning
        </div>
        <div className="flex  z-5 justify-center items-center sm:gap-18 gap-10 font-semibold text-black text-md w-1/2 h-full ">
          <Link
            to="/"
            className="text-white text-center  px-2 py-1  hover:rounded-xl font-semibold hover:bg-[#0b707739]"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-white text-center  px-2 py-1  hover:rounded-xl font-semibold hover:bg-[#0b707739]"
          >
            About Us
          </Link>
          {/* <Link
            to="/faculties"
            className="text-white text-center  px-2 py-1  hover:rounded-xl font-semibold hover:bg-[#0b707739]"
          >
            Facutlies
          </Link> */}
        </div>
        <div className="flex justify-evenly px-5 items-center w-1/3 h-full">
          {/* <button
            className="text-[#0B7077] z-20 ps-2 pe-6 lg:py-3  rounded-xl font-semibold bg-[#ffffffdf] hover:bg-[#E1E1E1] hover:scale-105 md:py-0.5"
            onClick={() => (window.location.href = "/enrollnow")}
          >
            ENROLL NOW
          </button> */}
          <button
            className="text-white ps-2 pe-6 lg:py-3 rounded-xl font-semibold bg-[#0B7077]  hover:scale-105 "
            onClick={() => (window.location.href = "/enrollnow ")}
          >
            CONTACT US
          </button>
        </div>
        <img
          src="/navDecor/Vector-1.svg"
          className="absolute  top-0 left-10 opacity-60"
          alt=""
        />
        <img
          src="/navDecor/Vector-2.svg"
          className="absolute  top-0 left-10 opacity-60"
          alt=""
        />
        <img
          src="/navDecor/Vector.svg"
          className="absolute  top-0 left-10 opacity-60"
          alt=""
        />
      </div>

      {/* Mobile Navbar */}
      <div className="lg:hidden h-[93px] w-full relative bg-[#6BC74C]">
        <div className="flex justify-between items-center p-5">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <img src="/ABHIGYAN_GURUKUL_logo.svg" alt="" className="h-10" />
            </Link>
            <h1 className="text-white font-bold text-lg">Abhigyan Gurukul</h1>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
          >
            {isMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
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
              </svg>
            )}
          </button>
        </div>

        <img
          src="/navDecor/Vector-1.svg"
          className="absolute   top-0 -left-16 opacity-60"
          alt=""
        />
        <img
          src="/navDecor/Vector-2.svg"
          className="absolute   top-0 -left-16 opacity-60"
          alt=""
        />
        <img
          src="/navDecor/Vector.svg"
          className="absolute   top-0 -left-16 opacity-60"
          alt=""
        />
        {/* "Never stop learning" tag */}
        {/* <div className="flex mx-auto  text-xs w-fit text-[#252641] bg-white border rounded-lg font-semibold px-8 border-white py-1 ">
          Never stop learning
        </div> */}

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
                <motion.div
                  whileTap={{ scale: 1.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Link to="/" className="hover:text-[#0B7077] transition-all">
                    Home
                  </Link>
                </motion.div>
                <motion.div
                  whileTap={{ scale: 1.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Link
                    to="/about"
                    className="hover:text-[#0B7077] transition-all"
                  >
                    About Us
                  </Link>
                </motion.div>
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
      </div>
    </>
  );
};

export default Navbar;
