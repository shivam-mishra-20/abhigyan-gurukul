import React from "react";

export const Introduction = (info) => {
  return (
    <>
      <hr class="mt-30 border-t-1 border-black opacity-[18%] my-4" />

      <div className="text-[#317100] text-6xl font-semibold items-center justify-center w-fill text-center hidden:sm block ">
        Introduction
        <img
          src="/Intro-Pattern.png"
          className="w-fit h-3 ml-[calc(100%/1.9)] justfiy-center rotate-1 hidden sm:block"
          alt="Abhigyan Gurukul Intro Duction pattern"
        />
      </div>

      <section>
        <div class="mx-auto mt-5 max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 hover:shadow-2xl border-[1px] border-[#cedec9] rounded-lg">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center md:gap-8">
            <div>
              <div class="max-w-lg md:max-w-none">
                <h2 class="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  {info.Text}
                </h2>

                <button
                  class="mt-20  border-1 border-[#6BFF51] drop-shadow-xl text-center text-[#ffffff] ps-5 p-7 py-2 rounded-xl font-semibold bg-[#20B486]"
                  onClick={() => alert("Learn More")}
                >
                  Learn More{" "}
                </button>
              </div>
            </div>

            <div>
              <img src={info.img_url} class="rounded" alt="" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
