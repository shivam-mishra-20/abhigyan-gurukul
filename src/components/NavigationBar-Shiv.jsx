import React from "react";

export const NewNavbar = () => {
  return (
    <>
      <div className="relative flex flex-row items-center bg-[#6BC74C]  h-18">
        <div className="absolute flex items-center w-auto ml-5 size-15 justify-start sm:items-center sm:justify-start">
          <img
            src=".\src\assets\react.svg"
            alt="Abhigyan Gurukul"
            className="size-[60px]"
          />
          <h1 className="ml-4 text-white text-[20px]  font-semibold">
            Abhigyan Gurukul
          </h1>
        </div>

        <div className="absolute z-10 ml-30 mt-20 h-9 py-[6px] w-50 text-center rounded-[5px] drop-shadow-[50px]  bg-white hidden sm:block">
          Never Stop Learning
        </div>
        <img
          src=".\src\assets\Group236.png"
          alt="Abhigyan Gurukul Navbar Pattern"
          className="absolute mt-8 z-11 w-fit h-auto"
        />

        <div className="z-13 ml-[600px] space-x-14 mr-5 w-auto justify-end items-center h-8 px-2 py-1 hidden sm:flex">
          <a href="#" className="text-black font-semibold hover:text-gray-300">
            Home
          </a>
          <a href="#" className="text-black font-semibold hover:text-gray-300">
            About Us
          </a>
          <a href="#" className="text-black font-semibold hover:text-gray-300">
            Faculties
          </a>
          <button
            className=" ml-30 bg-[white] text-[#0B7077] font-semibold h-9 w-23 rounded-[8px] hover:bg-green-700"
            onClick={() => console.log("Hello")}
          >
            Contact Us
          </button>
          <button
            className=" bg-[#0B7077] text-white h-9 -ml-5 w-24 rounded-[8px] font-semibold hover:bg-green-700"
            onClick={() => console.log("Hello")}
          >
            Enroll Now{" "}
          </button>
        </div>

        {/* Mobile Button for Contact Us */}
        <button
          className="z-14 ml-76 w-23 h-8 text-center items-center rounded-[8px] bg-white sm:hidden"
          onClick={() => console.log("Hello")}
        >
          Contact us
        </button>
      </div>

      <div className=" -mt-1 w-full h-154 hidden sm:block ">
        {/* <h1 className="absolute z-10 text-[50px]">
          {" "}
          Welcome to Abhigyan Gurukul{" "}
        </h1> */}

        <img
          src=".\src\assets\Photo-2.png"
          className="-z-1 object-fill w-[1920px] h-154 mr-2 rounded-bl-[20px] rounded-br-[20px]  "
        ></img>
      </div>
    </>
  );
};
