import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden   lg:flex w-[full]  relative py-7 items-center justify-center bg-[#6BC74C] h-[70px]">
        <div className="flex justify-evenly px-5 items-end w-1/3 h-full">
          <div className="flex h-full items-center">
            <img
              src="/ABHIGYAN_GURUKUL_logo.svg"
              className="self-center h-[60px] w-[60px] rounded-full"
              alt=""
            />
          </div>

          <h1 className="text-white font-bold text-xl">Abhigyan Gurukul</h1>
        </div>
        <div className=" absolute text-[#252641] bg-white border rounded-lg font-semibold px-14 border-white  py-1  hidden lg:flex lg:left-[170px] 2xl:left-[250px] -bottom-3">
          Never stop learning
        </div>
        <div className="flex  justify-center items-center sm:gap-18 gap-10 font-semibold text-black text-md w-1/2 h-full">
          <a>Home</a>
          <a>About Us</a>
          <a>Faculties</a>
        </div>
        <div className="flex justify-evenly px-5 items-center w-1/3 h-full">
          <button className="text-[#0B7077] ps-5 pe-14 py-2 rounded-xl font-semibold bg-[#ffffffdf]">
            ENROLL NOW
          </button>
          <button className="text-white ps-5 pe-14 py-2 rounded-xl font-semibold bg-[#0B7077]">
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
            <img src="/ABHIGYAN_GURUKUL_logo.svg" alt="" className="h-10" />
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
        {isMenuOpen && (
          <div className="bg-[#6BC74C] border-t border-[#5ab33f] pb-4">
            <div className="flex flex-col items-center gap-6 py-4 font-semibold text-black text-md">
              <h1>Home</h1>
              <h1>About Us</h1>
              <h1>Faculties</h1>
            </div>
            <div className="flex flex-col space-y-3 px-5">
              <button className="text-[#0B7077] py-2 rounded-xl font-semibold bg-[#ffffffdf]">
                LOG IN
              </button>
              <button className="text-white py-2 rounded-xl font-semibold bg-[#0B7077]">
                SIGN UP
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="z-16 h-90 w-full  hidden lg:block">
        <img
          src="/Photo-2.png"
          alt="Abhigyan Gurukul Banner Photo"
          className="object-cover w-full h-full rounded-br-2xl rounded-bl-2xl"
        />
      </div>
    </>
  );
};

export default Navbar;
