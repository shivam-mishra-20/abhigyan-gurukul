const Home = () => {
  return (
    <div
      style={{
        backgroundImage: `url("/Hero.svg")`,
      }}
      className="h-full min-h-[550px]  relative bg-no-repeat w-full flex flex-row justify-start items-center"
    >
      <div className="">
        <img
          src="/linesHome/Vector.svg"
          className=" absolute top-0 opacity-60"
          alt=""
        />
        <img
          src="/linesHome/Vector-1.svg"
          className="  absolute top-0 opacity-60"
          alt=""
        />
        <img
          src="/linesHome/Vector-2.svg"
          className="  absolute top-0 opacity-60"
          alt=""
        />
        <img
          src="/linesHome/Vector-3.svg"
          className="  absolute top-0 opacity-60"
          alt=""
        />
        <img
          src="/linesHome/Vector-4.svg"
          className="  absolute top-0 opacity-60"
          alt=""
        />
        <img
          src="/linesHome/Vector-5.svg"
          className=" absolute top-0  opacity-60"
          alt=""
        />
        <img
          src="/linesHome/Vector-6.svg"
          className=" absolute top-0  opacity-60"
          alt=""
        />
        <img
          src="/linesHome/Vector-7.svg"
          className=" absolute top-0  opacity-60"
          alt=""
        />
      </div>
      <div className="flex text-5xl  font-bold flex-col px-28 relative w-3/4 justify-center  items-start">
        <h1 className="text-[#FFFFFF] text-nowrap">
          <span className="text-[#00ff78]">Welcome</span>{" "}
          <span className="text-[#00FFB0]">to</span>{" "}
          <span className="underline">Abhigyan Gurukul</span>
        </h1>
        <h1 className="text-[#FFFFFF] Pacifico text-nowrap">
          up your
          <span className="text-[#00FFB0]"> skills</span> <br /> To
          <span className="text-[#00FFB0]">Advance</span> Your
          <span className="text-[#00FFB0]"> Career</span> Path
        </h1>
      </div>
      <div className="flex w-1/3 justify-center items-center">
        <img src="/ABHIGYAN_GURUKUL_logo.svg" className="md:h-[200px]" alt="" />
      </div>
    </div>
  );
};

export default Home;
