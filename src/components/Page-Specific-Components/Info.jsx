import React from "react";

const Info = () => {
  const features = [
    {
      id: "01",
      title: "Learning Approach",
      description:
        "We integrate ancient wisdom with modern education, nurturing intellectual, emotional, and spiritual growth. Our focus is not just on academic excellence but also on character building and personal development.",
      color: "text-green-600",
    },
    {
      id: "02",
      title: "Personalized Attention",
      description:
        "We believe every student is unique. Our customized teaching methods ensure that each student receives individual attention tailored to their learning style and pace.",
      color: "text-pink-500",
    },
    {
      id: "03",
      title: "Experienced Mentors",
      description:
        "Our educators are not just subject experts but also mentors who inspire and guide students. They bring a wealth of knowledge and real-world experience.",
      color: "text-green-600",
    },
    {
      id: "04",
      title: "Values and Discipline",
      description:
        "Rooted in the Gurukul tradition, we emphasize discipline, respect, and moral values. Our students learn the importance of integrity, humility, and compassion.",
      color: "text-pink-500",
    },
    {
      id: "05",
      title: "Comprehensive Curriculum",
      description:
        "We offer a diverse range of courses from competitive exams like JEE, Pre-Medical, and Commerce to foundational courses and Olympiad preparation.",
      color: "text-green-600",
    },
    {
      id: "06",
      title: "Learning Environment",
      description:
        "Our campus is designed to provide a peaceful and inspiring environment, conducive to learning and self-discovery.",
      color: "text-pink-500",
    },
  ];

  return (
    <>
      {/* Big Ass Logo */}
      <div className="flex mt-10 flex-col items-center justify-center space-y-4">
        <img
          src="/ABHIGYAN_GURUKUL_logo.svg"
          alt="Abhigyan Gurkul SVG LOGO"
          className="size-80"
        />
      </div>
      <hr className="border-t-1 mt-10 mb-10 border-black opacity-[18%] my-4" />
      {/* Introduction */}
      <div className="text-[#317100] text-6xl font-semibold text-center hidden sm:block">
        Introduction
        <img
          src="/Intro-Pattern.png"
          className="w-fit h-3 ml-[calc(100%/1.9)] justify-center rotate-1 hidden sm:block"
          alt="Intro Pattern"
        />
      </div>
      {/* Introduction Section */}
      <section>
        <div className="mx-auto mt-5 max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 hover:shadow-2xl border-[1px] border-[#cedec9] rounded-lg">
          <div className="grid grid-cols-1 gap-4 md:items-center md:gap-8">
            <div>
              <div className="md:max-w-none">
                <h2 class="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  <p className="text-center">
                    At{" "}
                    <span className="text-[#20B486] font-semibold">
                      Abhigyan Gurukul
                    </span>
                    , we blend the wisdom of{" "}
                    <span className="font-semibold">ancient</span> traditions
                    with{" "}
                    <span className="text-[#20B486] font-semibold">
                      modern education
                    </span>{" "}
                    to nurture young minds in a way that fosters{" "}
                    <span className="text-[#20B486] font-semibold">
                      intellectual
                    </span>
                    ,{" "}
                    <span className="text-[#20B486] font-semibold">
                      emotional
                    </span>
                    , and{" "}
                    <span className="text-[#20B486] font-semibold">
                      spiritual growth
                    </span>
                    . Rooted in the principles of{" "}
                    <span className="text-[#20B486] font-semibold">
                      Gurukul-style learning
                    </span>
                    , our institution is committed to providing a well-rounded
                    education that prepares students for both{" "}
                    <span className="text-[#20B486] font-semibold">
                      academic excellence
                    </span>{" "}
                    and{" "}
                    <span className="text-[#20B486] font-semibold">
                      personal development
                    </span>
                    .
                    <br />
                    <br />
                    <br />
                  </p>

                  <p className="text-center mt-6">
                    Our curriculum integrates{" "}
                    <span className="text-[#20B486] font-semibold">
                      time-honored
                    </span>{" "}
                    values,{" "}
                    <span className="text-[#20B486] font-semibold">
                      disciplined learning
                    </span>
                    , and a deep respect for nature, ensuring that students grow
                    into{" "}
                    <span className="text-[#20B486] font-semibold">
                      responsible
                    </span>
                    ,{" "}
                    <span className="text-[#20B486] font-semibold">
                      compassionate
                    </span>
                    , and{" "}
                    <span className="text-[#20B486] font-semibold">
                      knowledgeable
                    </span>{" "}
                    individuals. With experienced mentors, a serene learning
                    environment, and a focus on both{" "}
                    <span className="text-[#20B486] font-semibold">
                      traditional
                    </span>{" "}
                    and{" "}
                    <span className="text-[#20B486] font-semibold">
                      contemporary
                    </span>{" "}
                    knowledge,{" "}
                    <span className="text-[#20B486] font-semibold">
                      Abhigyan Gurukul
                    </span>{" "}
                    is <span className="italic">more</span> than just a Coaching
                    institute—it's a journey toward{" "}
                    <span className="text-[#20B486] font-semibold">
                      enlightenment
                    </span>{" "}
                    and{" "}
                    <span className="text-[#20B486] font-semibold">
                      self-discovery
                    </span>
                    .
                  </p>
                </h2>
                ;
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Images */}
      <div className="grid grid-cols-2 gap-4 mx-auto mt-5 max-w-screen-xl lg:px-4 lg:py-8 sm:px-6 :px-8">
        <img
          className="rounded-lg w-full object-cover"
          src="/Photo1.jpg"
          alt="Photo 1"
        />
        <img
          className="rounded-lg w-full object-cover"
          src="/Photo2.jpg"
          alt="Photo 2"
        />
      </div>
      {/* Divider */}
      <hr className="border-t-1 mt-10  border-black opacity-[18%] my-4" />
      {/* Why Choose Us Section */}
      <div className="max-w-screen-xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-green-700 mb-10">
          Why Choose Abhigyan Gurukul?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white border border-gray-200 shadow-lg rounded-lg hover:shadow-xl transition duration-300"
            >
              <h3 className={`text-xl font-bold ${feature.color}`}>
                {feature.id} {feature.title}
              </h3>
              <p className="text-gray-600 mt-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t-1 mt-10  border-black opacity-[18%] my-4" />
      {/*Vision and Mission */}
      <section>
        <div className="text-[#317100] text-6xl font-semibold text-center hidden sm:block">
          Our Vision
          <img
            src="/Intro-Pattern.png"
            className="w-fit h-3 ml-[calc(100%/1.9)] justify-center rotate-1 hidden sm:block"
            alt="Intro Pattern"
          />
        </div>
        <div className="mx-auto mt-5 max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 hover:shadow-2xl border-[1px] border-[#cedec9] rounded-lg">
          <div className="grid grid-cols-1 gap-4 md:items-center md:gap-8">
            <div>
              <div className="md:max-w-none">
                <h3 className="text-4xl font-semibold text-red-500 mb-2">
                  Vision:
                </h3>
                <h2 class="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  <p className="text-2xl text-gray-800">
                    To make{" "}
                    <span className="text-teal-500 font-medium">
                      quality education
                    </span>{" "}
                    accessible at every level of education. To make learning a
                    process to{" "}
                    <span className="text-teal-500 font-medium">enjoy</span> and{" "}
                    <span className="text-teal-500 font-medium">grow</span>{" "}
                    rather than a hassle. To{" "}
                    <span className="text-teal-500 font-medium">
                      prioritize
                    </span>{" "}
                    students to ensure learning, rather than providing
                    standardized and same content to everyone. To provide{" "}
                    <span className="text-teal-500 font-medium">
                      customized attention
                    </span>{" "}
                    to{" "}
                    <span className="text-teal-500 font-medium">
                      every type
                    </span>{" "}
                    of students, so that each one can grow ahead from the{" "}
                    <span className="text-teal-500 font-medium">stage</span>,
                    they started.
                  </p>
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Info;
