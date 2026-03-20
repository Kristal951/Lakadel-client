"use client";
import React, { useState } from "react";
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaTiktok,
  FaLinkedinIn,
} from "react-icons/fa";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import emailjs from "@emailjs/browser";
import { useToast } from "@/hooks/useToast";
import Spinner from "../ui/spinner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<null | "success" | "error" | "loading">(
    null,
  );
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const { showToast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID! ,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          name: formData.name,
          email: formData.email,
          phone,
          message: formData.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      );

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setPhone(undefined);
      showToast("Message sent successfully!", "success");
    } catch (error) {
      console.error(error);
      setStatus("error");
      showToast("Error sending message, try again later!", "error");
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-20 py-10">
      {/* ✅ phones = column, large screens = row */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        {/* LEFT */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 sm:gap-10 lg:pt-6">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl font-serif text-[#B10E0E] font-light">
              Connect with Us
            </h2>
            <p className="mt-3 text-black/80">
              Follow our journey, explore our collections, or reach out
              directly.
            </p>
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6">
              <a
                href="https://instagram.com/yourbrand"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B10E0E] hover:text-black text-2xl transition"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              <a
                href="https://facebook.com/yourbrand"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B10E0E] hover:text-black text-2xl transition"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>

              <a
                href="https://twitter.com/yourbrand"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B10E0E] hover:text-black text-2xl transition"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>

              <a
                href="https://tiktok.com/@yourbrand"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B10E0E] hover:text-black text-2xl transition"
                aria-label="TikTok"
              >
                <FaTiktok />
              </a>

              <a
                href="https://linkedin.com/company/yourbrand"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B10E0E] hover:text-black text-2xl transition"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </a>
            </div>

            <div className="space-y-2 text-center lg:text-left">
              <div className="text-gray-800 text-base sm:text-lg">
                <span className="font-semibold">Email:</span>{" "}
                <a
                  href="mailto:contact@yourbrand.com"
                  className="hover:underline"
                >
                  lakadel.lkdl@gmail.com
                </a>
              </div>

              <div className="text-gray-800 text-base sm:text-lg">
                <span className="font-semibold">Phone:</span>{" "}
                <a href="tel:+1234567890" className="hover:underline">
                  +1 234 567 890
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-1/2">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl font-serif text-[#B10E0E] font-light">
              Get in Touch
            </h2>
            <p className="mt-3 text-black/80">
              We'd love to hear from you. Send us a message for inquiries or
              collaborations.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 flex w-full flex-col gap-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-[#B10E0E] outline-0 focus:border-black focus:ring-0 p-3 rounded text-gray-900 placeholder-gray-400 transition"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-[#B10E0E] outline-0 focus:border-black focus:ring-0 p-3 rounded text-gray-900 placeholder-gray-400 transition"
              required
            />

            {/* Phone Input Wrapper */}
            <div className="w-full border border-[#B10E0E] rounded overflow-hidden focus-within:border-black transition bg-white">
              <PhoneInput
                placeholder="Your Phone Number"
                value={phone}
                onChange={setPhone}
                defaultCountry="US"
                international
                countryCallingCodeEditable
                className="w-full"
                inputComponent={({ value, onChange, ...props }: any) => (
                  <input
                    {...props}
                    value={value}
                    onChange={onChange}
                    className="w-full h-12 px-3 text-gray-900 placeholder-gray-400 outline-none"
                  />
                )}
              />
            </div>

            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              className="w-full border border-[#B10E0E] outline-0 focus:border-black focus:ring-0 p-4 rounded text-gray-900 placeholder-gray-400 h-36 sm:h-40 transition"
              required
            />

            <button
              type="submit"
              className="w-full border flex items-center justify-center border-[#B10E0E] text-[#B10E0E] px-10 py-4 text-sm tracking-widest uppercase hover:bg-[#B10E0E] hover:text-white transition"
            >
              {status === "loading" ? (
                <Spinner w="5" h="5" />
              ) : (
                <p>Send Message</p>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}