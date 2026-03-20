"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    image: "/assets/Slide_1.jpg", // Replace with your image paths
    title: "Timeless Sophistication",
  },
  {
    id: 2,
    image: "/assets/Slide_2.jpg",
    title: "Modern Minimalist",
  },
];

export const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative h-screen w-screen flex flex-col justify-center items-center overflow-hidden bg-background"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[index].id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute z-0 inset-0"
        >
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-black/20 z-10" />
          
          <img
            src={slides[index].image}
            alt={slides[index].title}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 flex gap-3 z-20">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-0.5 w-8 transition-all duration-500 ${
              i === index ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
};