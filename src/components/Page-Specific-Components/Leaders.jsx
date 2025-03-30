import React from "react";

const Leaders = ({ info, isFlagged }) => {
  const leaders1 = [
    {
      name: info.title,
      subject: "Mathematics B.Tech CSE",
      img: "/AbgNew2.jpg",
    },
    {
      name: info.title2,
      subject: "Physics B.Tech ECE",
      img: "/ChandanSirGlasses2.jpg",
    },
  ];
  const core = [
    {
      name: "Kedar Sir",
      subject: "Physics - IIT BOMBAY",
      img: "/KedarSirCropped.jpg",
    },
    {
      name: "Ankit Sir",
      subject: "Chemistry - PHD",
      img: "/AnkitSirCropped.jpg",
    },
    { name: "Bhanu Sir", subject: "Biology - PHD", img: "/placeholder.png" },
    {
      name: "Sonia Ma'am",
      subject: "Commerce - Accounts",
      img: "/SoniaMaam.jpg",
    },
    {
      name: "Nitesh Sir",
      subject: "Mathematics",
      img: "/Nitesh.png",
    },
  ];

  const Others = [
    { name: "Nitish Sir", subject: "Social Science", img: "/Nitish.png" },
    {
      name: "Dhara Ma'am",
      subject: "English/EVS/Social Science",
      img: "/DharaMam.png",
    },
    {
      name: "Prakash Sir",
      subject: "Hindi/Gujarati/Sanskrit",
      img: "/PrakashSir.jpg",
    },
    {
      name: "Pratyaksha Ma'am",
      subject: "English/EVS",
      img: "/PratyakshaCropped.jpg",
    },
    { name: "Shivam Sir", subject: "Tech Team", img: "/Shivam.png" },
    { name: "Sarman Sir", subject: "Tech Team", img: "/Sarman.jpg" },
  ];

  if (isFlagged) {
    leaders1.push({
      name: "New Member",
      subject: "Instructor",
      img: "/leader3.jpg",
    });
  }

  return (
    <>
      {/* Leader Section - Now Scales Dynamically */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-xl border border-gray-200">
          <h2 className="text-3xl font-semibold text-center text-green-700 mb-6">
            Our <span className="font-bold text-[#E46E93]">Leaders</span>
          </h2>

          {/* Leader Cards - Auto Adjust */}
          <div className="flex flex-wrap justify-center gap-6">
            {leaders1.map((leader, index) => (
              <div
                key={index}
                className="w-[280px] bg-white p-2 rounded-lg shadow-md transition-transform transform hover:scale-105 "
              >
                <img
                  src={leader.img}
                  alt={leader.name}
                  className="w-full h-70 object-cover rounded-lg"
                />
                <h3 className="mt-3 text-lg font-semibold text-center">
                  {leader.name}
                </h3>
                <p className="text-center text-gray-600">{leader.subject}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr class="mt-20 mb-20 border-t-1 border-black opacity-[18%] my-4" />

      {/* Leader Section - 2 - Now Scales Dynamically */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-xl border border-gray-200">
          <h2 className="text-3xl font-semibold text-center text-green-700 mb-6">
            Our <span className="font-bold text-[#E46E93]">Core</span> Faculties
          </h2>

          {/* Leader Cards - Auto Adjust */}
          <div className="flex flex-wrap justify-center gap-6">
            {core.map((core, index) => (
              <div
                key={index}
                className="w-[220px] bg-white p-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                <img
                  src={core.img}
                  alt={core.name}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <h3 className="mt-3 text-lg font-semibold text-center">
                  {core.name}
                </h3>
                <p className="text-center text-gray-600">{core.subject}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr class="mt-20 mb-20 border-t-1 border-black opacity-[18%] my-4" />

      {/* Leader Section - 3 - Now Scales Dynamically */}
      <div className="w-full flex justify-center">
        <div className="w-8xl max-w-8xl mx-auto p-6 bg-white rounded-lg shadow-xl border-1 border-gray-200">
          <h2 className="text-3xl font-semibold text-center text-green-700 mb-6">
            Our Other <span className="font-bold text-[#E46E93]">Teachers</span>
          </h2>

          {/* Leader Cards - Auto Adjust */}
          <div className="flex flex-wrap justify-center gap-6">
            {Others.map((Others, index) => (
              <div
                key={index}
                className="w-[200px] bg-white p-2 rounded-lg shadow-md transition-transform transform hover:scale-105 border-1 border-gray-200"
              >
                <img
                  src={Others.img}
                  alt={Others.name}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <h3 className="mt-3 text-lg font-semibold text-center">
                  {Others.name}
                </h3>
                <p className="text-center text-gray-600">{Others.subject}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Leaders;
