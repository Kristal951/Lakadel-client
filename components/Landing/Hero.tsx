"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    image: "/assets/Slide_1.jpg",
  },
  {
    id: 2,
    image: "/assets/Slide_2.jpg",
  },
];

export const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative md:h-[150vh] h-screen w-screen flex flex-col justify-center items-center overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[index].id}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute z-0 inset-0"
        >
          <div className="absolute inset-0 bg-black/20 z-10" />

          <motion.img
            src={slides[index].image}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "linear" }}
            className="absolute inset-0 w-full h-full object-top object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
