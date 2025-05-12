import React from "react";
import { motion } from "framer-motion";

const PartnershipsSection = () => {
  // Sample partner logos - replace with actual partner logos
  const partners = [
    {
      id: 1,
      name: "Education Board",
      logo: "https://cdn.pixabay.com/photo/2017/03/16/21/18/logo-2150297_960_720.png",
    },
    {
      id: 2,
      name: "Science Foundation",
      logo: "https://cdn.pixabay.com/photo/2017/01/31/13/14/animal-2023924_960_720.png",
    },
    {
      id: 3,
      name: "Tech Institute",
      logo: "https://cdn.pixabay.com/photo/2017/01/13/01/22/rocket-1976107_960_720.png",
    },
    {
      id: 4,
      name: "Research Center",
      logo: "https://cdn.pixabay.com/photo/2017/01/31/23/42/animal-2028258_960_720.png",
    },
    {
      id: 5,
      name: "University Alliance",
      logo: "https://cdn.pixabay.com/photo/2016/12/05/20/25/university-1884966_960_720.png",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Our Partners & Collaborations
          </h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We collaborate with leading educational institutions and
            organizations to provide the best learning experience
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-16 max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <p className="text-gray-500 italic">
            Interested in partnering with us?{" "}
            <a href="#" className="text-green-600 font-medium hover:underline">
              Contact our team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnershipsSection;
