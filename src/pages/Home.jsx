import React from "react";
import { Introduction } from "../components/Introduction";
import VideoCarousel from "../components/VideoCarousel";
import "../App.css";
import Banner from "../components/Banner";
import { MajorFeatures } from "../components/MajorFeatures";
import ResultCarousel from "../components/ResultCarousel";

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
      have mastered the art of{" "}
      <span className="font-bold text-[#F76060]">Teaching</span> Click on "
      <span className=" font-bold text-green-600">View All</span>" to look at
      all the
      <span className="font-bold text-[#F76060]"> Faculties -</span>
    </p>
  );

  const IntroBanner = "/IntroWalaPhoto.jpg";
  const FacultyBanner = "/AbgChndn.png";

  return (
    <>
      <Banner />

      {/* Image Carousel */}
      {/* <ImageCarousel /> */}
      {/* Introduction */}
      <Introduction
        title="Introduction"
        Text={text1}
        img_url={IntroBanner}
        button_text="Learn More"
        imageUrls={["/image1.jpg", "/image2.jpg", "/image3.jpg"]}
        route="/about"
      />
      {/* Faculties Introduction */}
      <Introduction
        title="The Masters of Teaching"
        img_url2="/Faculty-Title.png"
        Text={Faculty_Intro}
        img_url={FacultyBanner}
        button_text="View All"
        route={"/"}
      />

      {/* Major Features */}
      <MajorFeatures></MajorFeatures>
      {/* Video Carousel */}
      <VideoCarousel />

      {/* Image Carousel */}
      <ResultCarousel></ResultCarousel>
    </>
  );
};

export default Home;
