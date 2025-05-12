import React from "react";
import { Carousel } from "antd";

const HomePageMainCarousel = () => {
  const isMobile = window.innerWidth <= 768; // Check if the screen width is mobile size

  return (
    <div className="overflow-hidden">
      <Carousel autoplay autoplaySpeed={3000} adaptiveHeight dots>
        <div>
          <img
            src={
              isMobile
                ? "/Result_of_10th_GSEB_mobile.png"
                : "/Result_of_10th_GSEB.png"
            }
            alt="Image 1"
            className="w-full h-fit md:h-fit object-cover"
          />
        </div>
        <div>
          <img
            src={
              isMobile
                ? "/Result_of_10th_GSEB_2_mobile.png"
                : "/Result_of_10th_GSEB_2.png"
            }
            alt="Image 2"
            className="w-full h-fit md:h-fit object-cover"
          />
        </div>
      </Carousel>
    </div>
  );
};

export default HomePageMainCarousel;
