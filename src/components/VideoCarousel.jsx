import React from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const videoData = [
  {
    id: "1",
    title: "Economics class 10 ",
    description: "Class 10 Economics",
    duration: "12 min",
    rating: 4.7,
    reviews: 1023,
    author: "Abhigyan Sir",
    price: "Free",
    youtubeId: "oQEHl4hW3kI",
  },
  {
    id: "2",
    title: "Matrix Advanced Concepts",
    description: "Deep dive into Matrix and its advanced Concepts!",
    duration: "15 min",
    rating: 4.5,
    reviews: 850,
    author: "Abhigyan Sir",
    price: "Free",
    youtubeId: "PIFMDqPYewY",
  },
  {
    id: "3",
    title: "Trigonometry Functions",
    description: "Learn about Trigonometry Functions and its applications.",
    duration: "20 min",
    rating: 4.6,
    reviews: 980,
    author: "Abhigyan Sir",
    price: "Free",
    youtubeId: "dbZFtkhtfmk",
  },
  {
    id: "4",
    title: "Matrix Triple Product",
    description: "Introductory video to Matrix Product",
    duration: "20 min",
    rating: 4.6,
    reviews: 980,
    author: "Abhigyan Sir",
    price: "Free",
    youtubeId: "LB7iGImrk_Q",
  },
];

const VideoCarousel = () => {
  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    slides: { perView: 3, spacing: 16 },
    breakpoints: {
      "(max-width: 1024px)": { slides: { perView: 2 } },
      "(max-width: 768px)": { slides: { perView: 1 } },
    },
  });

  return (
    <>
      <hr className="mt-30 mb-30 border-t-1 border-black opacity-[18%] my-4" />
      <section className="bg-white">
        <div className="mx-auto border-[1px] border-[#cedec9] rounded-lg hover:shadow-2xl max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-center text-4xl font-semibold text-[#317100] sm:text-5xl">
            Watch Free Tutorials
          </h2>
          <div className="relative mt-8">
            <div className="keen-slider" ref={sliderRef}>
              {videoData.map((video) => (
                <div key={video.id} className="keen-slider__slide">
                  <div className="border h-fit rounded-lg shadow-sm overflow-hidden">
                    <div className="relative">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                          alt={video.title}
                          className="w-full h-56 object-cover"
                        />
                      </a>
                      <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold">{video.title}</h3>
                      <p className="text-sm text-gray-600">
                        {video.description}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-500">
                          ★ {video.rating}
                        </span>
                        <span className="text-gray-500 ml-2">
                          ({video.reviews} reviews)
                        </span>
                      </div>
                      <p className="text-gray-700 mt-2">By {video.author}</p>
                      <p className="text-green-600 font-bold mt-1">
                        {video.price}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => slider.current?.prev()}
                className="border-1 border-[#6BFF51] drop-shadow-xl text-center text-[#ffffff] ps-5 p-7 py-2 rounded-xl font-semibold bg-[#20B486]"
              >
                ◀ Previous
              </button>
              <button
                onClick={() => slider.current?.next()}
                className="border-1 border-[#6BFF51] drop-shadow-xl text-center text-[#ffffff] ps-5 p-7 py-2 rounded-xl font-semibold bg-[#20B486]"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default VideoCarousel;
