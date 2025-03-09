import React from "react";

export const NavigationBar = ({ info }) => {
  return (
    <>
      <div className="z-1 flex flex-row flex-nowrap bg-[#6BC74C] items-center  h-15">
        <div>
          <img
            src=".\src\assets\react.svg"
            className=" ml-10 size-[50px]"
            alt="Abhigyan Gurukul"
          />
        </div>
        <h1 className="z-2  w-600   text-white ml-10 text-[17px] font-semibold">
          Abhigyan Gurukul
        </h1>

        <div className="z-3 absolute mt-15 w-45 text-center text-[15px] bg-white ml-35 hidden sm:block rounded-[8px]">
          Never Stop Learning
        </div>

        <div>
          <img
            src=".\src\assets\Group236.png"
            className="absolute w-fit -mt-7 ml-10 size-[50px]"
            alt="Abhigyan Gurukul"
          />
        </div>

        <div className="z-10 flex flex-row flex-nowrap space-x-7 mr-179">
          <a href="#" className="text-white text-[14px] font-semibold">
            Home
          </a>
          <a
            href="#"
            className=" w-15 text-white text-[14px] font-semibold ml-5"
          >
            About Us
          </a>
          <a href="#" className="text-white text-[14px] font-semibold ml-5">
            Faculties
          </a>
        </div>
        <button className="z-10  bg-blue-500 text-white rounded-[8px]   font-semibold">
          Enroll Now
        </button>
        <button className="z-10 ml-10 bg-blue-500 text-white rounded-[8px] font-semibold">
          Contact us
        </button>
      </div>
      {/* Banner */}
      <div className="z-16 h-90 w-screen bg-red-500 mt-1 ">
        <img
          src=".\src\assets\Banner-Photo.jpg"
          alt="Abhigyan Gurukul Banner Photo"
          className="z-1 w-fit h-200"
        />
      </div>
    </>
  );
};
