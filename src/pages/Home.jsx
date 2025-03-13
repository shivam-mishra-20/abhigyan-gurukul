import React from "react";
import Navbar from "../components/Navbar";
import { Introduction } from "../components/Introduction";
import VideoCarousel from "../components/VideoCarousel";
import Footer from "../components/Footer";
import "../App.css";
import Banner from "../components/Banner";

const Home = () => {
  const text1 = (
    <p className="text-gray-600 text-3xl flex-wrap">
      At <span className="font-bold text-green-600">Abhigyan Gurukul</span>, we
      blend the wisdom of ancient traditions with
      <span className="font-bold text-green-600">modern education</span> to
      nurture young minds in a way that fosters
      <span className="font-bold text-green-600"> intellectual</span>,
      <span className="font-bold text-green-600"> emotional</span>, and
      <span className="font-bold text-green-600"> spiritual growth</span>.
    </p>
  );
  const Faculty_Intro = (
    <p className="text-gray-600 text-2xl mt-5 flex-wrap">
      Experience teaching from{" "}
      <span className="font-bold text-[#F76060]">Amazing Teachers</span> who
      have mastered the art of
      <span className="font-bold text-[#F76060]">Teaching</span> Click on "
      <span className=" font-bold text-green-600">View All</span>" to look at
      all the
      <span className="font-bold text-[#F76060]"> Faculties -</span>
    </p>
  );

  const IntroBanner = "/Banner-Photo.jpg";
  const FacultyBanner = "/Abhigyan_Gurukul_Faculty_Intro.png";
  return (
    <>
      <Banner />

      {/* Video Carousel */}
      <VideoCarousel />

      {/* Introduction */}
      <Introduction
        title="Introduction"
        Text={text1}
        img_url={IntroBanner}
        button_text="Learn More"
      />
      {/* Faculties Introduction */}
      <Introduction
        title="The Masters of Teaching"
        img_url2="/Faculty-Title.png"
        Text={Faculty_Intro}
        img_url={FacultyBanner}
        button_text="View All"
      />
    </>
  );
};

export default Home;
