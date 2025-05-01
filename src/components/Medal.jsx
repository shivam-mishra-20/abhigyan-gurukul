import { motion } from "framer-motion";

const Medal = ({ type }) => {
  const medals = {
    gold: { emoji: "🥇", color: "from-yellow-300 to-yellow-500" },
    silver: { emoji: "🥈", color: "from-gray-300 to-gray-400" },
    bronze: { emoji: "🥉", color: "from-amber-600 to-amber-700" },
  };

  return (
    <motion.div
      animate={{
        y: [0, -5, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
      className={`
        absolute -top-6 -left-6
        w-12 h-12 rounded-full
        bg-gradient-to-br ${medals[type].color}
        flex items-center justify-center
        shadow-lg z-10
        text-2xl
      `}
    >
      {medals[type].emoji}
    </motion.div>
  );
};

export default Medal;
