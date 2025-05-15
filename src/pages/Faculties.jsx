import React from "react";
import Leaders from "../components/Page-Specific-Components/Leaders";
import { facultyMembers } from "../data/facultyData";

const Faculties = ({ info, isFlagged }) => {
  // Export the faculty data for use in other components
  return (
    <>
      {/* Logo */}
      <div className="flex mt-10 flex-col items-center justify-center space-y-4">
        <img
          src="/ABHIGYAN_GURUKUL_logo.svg"
          alt="Abhigyan Gurukul SVG LOGO"
          className="w-40 sm:w-60 md:w-80 lg:w-96"
        />
      </div>

      {/* Divider */}
      <hr className="border-t border-black opacity-20 my-10" />

      <Leaders
        info={{
          title: "Abhigyan Gautam",
          title2: "Chandan Sir",
          Heading: "Our Leaders",
          facultyData: facultyMembers,
        }}
        isFlagged={false}
      ></Leaders>
    </>
  );
};

export default Faculties;
export { facultyMembers };
