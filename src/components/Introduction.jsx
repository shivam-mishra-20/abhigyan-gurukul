import React from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";

export const Introduction = (info) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <>
      <hr className="mt-30 mb-20 border-t-1 border-black opacity-[18%] my-4" />

      {/* Animated Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-[#317100] text-6xl font-semibold items-center justify-center w-fill text-center hidden:sm block"
      >
        {info.title}
        <motion.img
          src="/Intro-Pattern.png"
          className="w-fit h-3 ml-[calc(100%/1.9)] justify-center rotate-1 hidden sm:block"
          alt="Abhigyan Gurukul Introduction pattern"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
        />
      </motion.div>

      {/* Sections For Abhigyan Gurkul Introduction Page */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0, ease: "easeOut" }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
        }}
        className="mx-auto mt-5 max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 border-[1px] border-[#cedec9] rounded-lg transition-all duration-300"
      >
        {isMobile ? (
          // **Mobile View**
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            className="text-center"
          >
            <motion.img
              className="rounded-lg w-full"
              src={info.img_url}
              alt={info.alttext}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
            />
            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl mt-4">
              {info.Text}
            </h2>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-5 border-1 border-[#6BFF51] drop-shadow-xl text-center text-[#ffffff] px-5 py-3 rounded-xl font-semibold bg-[#20B486]"
              onClick={() => alert("Learn More")}
            >
              {info.button_text}
            </motion.button>
          </motion.div>
        ) : (
          // **Desktop View**
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center md:gap-8"
          >
            <div>
              <div className="max-w-lg md:max-w-none">
                <motion.img
                  className="rounded-lg"
                  src={info.img_url2}
                  alt={info.alttext}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.7 }}
                />
                <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  {info.Text}
                </h2>

                <a href={info.route}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-20 border-1 border-[#6BFF51] drop-shadow-xl text-center text-[#ffffff] px-5 py-2 rounded-xl font-semibold bg-[#20B486]"
                  >
                    {info.button_text}
                  </motion.button>
                </a>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
            >
              <img src={info.img_url} className="rounded" alt="" />
            </motion.div>
          </motion.div>
        )}
      </motion.section>
    </>
  );
};
