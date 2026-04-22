"use client";
import React from "react";
import {
  FaInstagram,
  FaTiktok,
  FaPinterestP,
} from "react-icons/fa";

export default function Contact() {
  return (
    <section className="h-2/5 w-full px-4 py-16 flex items-center flex-col bg-gray-50 gap-10">
      <div className="w-full max-w-5xl flex flex-col h-max items-center justify-center">
        <div className="flex gap-2 text-xl">
          {[
            { icon: FaInstagram, link: "https://www.instagram.com/lakadel_?igsh=MTNwMnp0eGRvbzFoNw==" },
            { icon: FaTiktok, link: "https://www.tiktok.com/@lakadel__?_r=1&_t=ZS-95Jds0ykovl" },
            {
              icon: FaPinterestP,
              link: "https://pin.it/5S5WSlClH",
            },
          ].map(({ icon: Icon, link }, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/10 hover:scale-110 rounded-full hover:bg-white hover:text-[#B10E0E] transition"
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>

      <div className="w-full h-max flex flex-col gap-2">
          <div className="w-full flex items-center flex-col justify-center gap-6">
            <h1 className="text-2xl font-bold uppercase">Contact Us</h1>

            <div className="w-full flex items-center flex-col gap-2">
              <h3 className="font-medium">ISSUES AND ORDER INQUIRIES</h3>
              <p className="font-light">orders@lakadel.com</p>
            </div>
            <div className="w-full flex items-center flex-col gap-2">
              <h3  className="font-medium">ALL OTHER INQUIRIES</h3>
               <p className="font-light">info@lakadel.com</p>
            </div>
          </div>
      </div>
    </section>
  );
}
