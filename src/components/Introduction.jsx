import React from "react";
import { useMediaQuery } from "react-responsive";

export const Introduction = (info) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <>
      <hr className="mt-30 mb-20 border-t-1 border-black opacity-[18%] my-4" />

      <div className="text-[#317100] text-6xl font-semibold items-center justify-center w-fill text-center hidden:sm block ">
        {info.title}
        <img
          src="/Intro-Pattern.png"
          className="w-fit h-3 ml-[calc(100%/1.9)] justfiy-center rotate-1 hidden sm:block"
          alt="Abhigyan Gurukul Intro Duction pattern"
        />
      </div>
      {/* Sections For Abhigyan Gurkul Introduction Page */}
      <section>
        <div className="mx-auto mt-5 max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 hover:shadow-2xl border-[1px] border-[#cedec9] rounded-lg">
          {isMobile ? (
            // **Mobile View**
            <div className="text-center">
              <img
                className="rounded-lg w-full"
                src={info.img_url}
                alt={info.alttext}
              />
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl mt-4">
                {info.Text}
              </h2>

              <button
                className="mt-5 border-1 border-[#6BFF51] drop-shadow-xl text-center text-[#ffffff] px-5 py-3 rounded-xl font-semibold bg-[#20B486]"
                onClick={() => alert("Learn More")}
              >
                {info.button_text}
              </button>
            </div>
          ) : (
            // **Desktop View**
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center md:gap-8">
              <div>
                <div className="max-w-lg md:max-w-none">
                  <img
                    className="rounded-lg"
                    src={info.img_url2}
                    alt={info.alttext}
                  />
                  <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                    {info.Text}
                  </h2>

                  <a href={info.route}>
                    <button
                      className="mt-20 border-1 border-[#6BFF51] drop-shadow-xl text-center text-[#ffffff] px-5 py-2 rounded-xl font-semibold bg-[#20B486]"
                      onClick={() => {
                        info.route;
                      }}
                    >
                      {info.button_text}
                    </button>
                  </a>
                </div>
              </div>

              <div>
                <img src={info.img_url} className="rounded" alt="" />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
