import { motion } from "framer-motion";
import Medal from "./Medal";

const StudentPodium = ({ position, student, delay }) => {
  const podiumStyles = {
    0: {
      medalType: "gold",
      height: "h-40",
      scale: "scale-110",
      containerClass: "z-20",
    },
    1: {
      medalType: "silver",
      height: "h-36",
      scale: "scale-100",
      containerClass: "z-10",
    },
    2: {
      medalType: "bronze",
      height: "h-32",
      scale: "scale-90",
      containerClass: "z-0",
    },
  };

  const style = podiumStyles[position];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: delay,
      }}
      className={`relative ${style.containerClass}`}
    >
      <Medal type={style.medalType} />

      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`
          relative bg-white rounded-2xl p-4
          shadow-xl hover:shadow-2xl
          transition-shadow duration-300
          flex flex-col items-center
          ${style.height} ${style.scale}
        `}
      >
        <div
          className={`
          w-20 h-20 rounded-full
          bg-gradient-to-br from-blue-500 to-blue-600
          flex items-center justify-center
          text-white text-2xl font-bold
          mb-2
        `}
        >
          {student.name.charAt(0)}
        </div>

        <h3 className="text-gray-800 font-bold text-center line-clamp-1">
          {student.name}
        </h3>

        <div className="mt-1 text-green-600 font-semibold">
          {student.percentage}%
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StudentPodium;
