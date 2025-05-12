import React, { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const ReviewSlider = () => {
  const reviews = [
    {
      name: "John Doe",
      text: "Great experience! Highly recommend.",
      img: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1180&q=80",
      rating: 5,
    },
    {
      name: "Jane Smith",
      text: "Loved the service. Will come back again!",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1180&q=80",
      rating: 4,
    },
    {
      name: "Alice Johnson",
      text: "Good experience, but there's room for improvement.",
      img: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1180&q=80",
      rating: 3,
    },
    {
      name: "Mark Wilson",
      text: "Exceptional service and friendly staff!",
      img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=1180&q=80",
      rating: 5,
    },
    {
      name: "Emily Brown",
      text: "Decent experience, but expected better.",
      img: "https://images.unsplash.com/photo-1546961329-78bef0c1c2f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1180&q=80",
      rating: 4,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    loop: true,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
    slides: { perView: 1, spacing: 20 },
    breakpoints: {
      "(min-width: 640px)": { slides: { perView: 2, spacing: 24 } },
      "(min-width: 1024px)": { slides: { perView: 3, spacing: 32 } },
    },
    defaultAnimation: { duration: 1000 },
  });

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (instanceRef.current) {
        instanceRef.current.next();
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [instanceRef]);

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24 border-2 border-gray-200 shadow-lg rounded-lg">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            What Our <span className="text-[#317100]">Parents</span> Say
          </h2>
          <div className="w-20 h-1.5 bg-[#20B486] mx-auto rounded-full"></div>
        </div>

        <div className="relative">
          <div
            ref={sliderRef}
            className="keen-slider min-h-[250px] md:min-h-[280px]"
          >
            {reviews.map((review, index) => (
              <div key={index} className="keen-slider__slide">
                <div className="h-full bg-white rounded-2xl shadow-lg border-2 border-[#e8f3e4] p-6 md:p-8 flex flex-col transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] hover:border-[#B9E0AD]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <img
                        alt={review.name}
                        src={review.img}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#20B486]"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <svg
                          className="w-5 h-5 text-[#20B486]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {review.name}
                      </h3>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <svg
                            key={starIndex}
                            xmlns="http://www.w3.org/2000/svg"
                            className={`w-5 h-5 ${
                              starIndex < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative flex-grow">
                    <svg
                      className="absolute top-0 left-0 w-10 h-10 text-gray-100 transform -translate-x-3 -translate-y-6"
                      fill="currentColor"
                      viewBox="0 0 32 32"
                    >
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    <p className="text-gray-600 italic pt-2">{review.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Navigation Controls */}
          {loaded && instanceRef.current && (
            <div className="flex justify-between items-center mt-8">
              <div className="flex space-x-2 justify-center">
                {[
                  ...Array(
                    instanceRef.current.track.details.slides.length
                  ).keys(),
                ].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => instanceRef.current.moveToIdx(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      currentSlide === idx
                        ? "w-8 bg-[#20B486]"
                        : "w-2.5 bg-gray-300"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  ></button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => instanceRef.current?.prev()}
                  className="p-2.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-[#20B486] hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#20B486] focus:ring-opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => instanceRef.current?.next()}
                  className="p-2.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-[#20B486] hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#20B486] focus:ring-opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewSlider;
