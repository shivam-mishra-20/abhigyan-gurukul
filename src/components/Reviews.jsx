import React from "react";
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

  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    defaultAnimation: { duration: 750 },
    slides: { perView: 1, spacing: 16 }, // Default to 1 review for small screens
    breakpoints: {
      "(min-width: 640px)": { slides: { perView: 2, spacing: 16 } }, // 2 reviews for medium screens
      "(min-width: 1024px)": { slides: { perView: 3, spacing: 16 } }, // 3 reviews for large screens
    },
  });

  return (
    <>
      <hr class="mt-30 mb-30 border-t-1 border-black opacity-[18%] my-4" />

      <section className="bg-white">
        <div className="mx-auto  border-[1px] border-[#cedec9] rounded-lg max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <h2 className="text-center text-4xl font-semibold text-[#317100] sm:text-5xl">
            Read Trusted Reviews from our Parents
          </h2>

          <div className="mt-8">
            <div ref={sliderRef} className="keen-slider">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="keen-slider__slide transition-opacity duration-500"
                >
                  <blockquote className="hover:shadow-2xl border-[1px] border-[#cedec9] rounded-lg p-6 shadow-xs sm:p-8">
                    <div className="flex items-center gap-4">
                      <img
                        alt={review.name}
                        src={review.img}
                        className="size-14 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex gap-0.5 text-green-500">
                          {Array.from({ length: review.rating }).map(
                            (_, starIndex) => (
                              <svg
                                key={starIndex}
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )
                          )}
                        </div>
                        <p className="mt-0.5 text-lg font-medium text-black">
                          {review.name}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-black">{review.text}</p>
                  </blockquote>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => slider.current?.prev()}
                className="px-4 py-2 text-white bg-blue-600 rounded-md"
              >
                Previous
              </button>
              <button
                onClick={() => slider.current?.next()}
                className="px-4 py-2 text-white bg-blue-600 rounded-md"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ReviewSlider;
