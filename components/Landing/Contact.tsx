"use client";
import React from "react";
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaTiktok,
  FaLinkedinIn,
} from "react-icons/fa";

export default function Contact() {
  return (
    <section className="min-h-screen w-full flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl overflow-hidden grid lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="bg-[#B10E0E] text-white p-10 flex flex-col justify-center gap-8">
          <div>
            <h2 className="text-3xl lg:text-5xl font-bold font-serif">
              Contact Us
            </h2>
            <p className="mt-4 text-white/80 leading-relaxed">
              Reach out to us through any of the channels below. We typically
              respond within 24–48 hours.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex gap-5 text-xl">
            {[
              { icon: FaInstagram, link: "https://instagram.com/yourbrand" },
              { icon: FaFacebookF, link: "https://facebook.com/yourbrand" },
              { icon: FaTwitter, link: "https://twitter.com/yourbrand" },
              { icon: FaTiktok, link: "https://tiktok.com/@yourbrand" },
              { icon: FaLinkedinIn, link: "https://linkedin.com/company/yourbrand" },
            ].map(({ icon: Icon, link }, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/10 rounded-full hover:bg-white hover:text-[#B10E0E] transition"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-10 flex flex-col justify-center gap-8">
          <h3 className="text-2xl font-semibold text-gray-800">
            Get in touch
          </h3>

          <div className="space-y-6 text-gray-700">
            {/* Email */}
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <a
                href="mailto:contact@yourbrand.com"
                className="text-lg font-medium hover:underline"
              >
                lakadel.lkdl@gmail.com
              </a>
            </div>

            {/* Phone */}
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <a
                href="tel:+1234567890"
                className="text-lg font-medium hover:underline"
              >
                +1 234 567 890
              </a>
            </div>

            {/* Optional Address (if needed) */}
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-lg font-medium">
                Lagos, Nigeria
              </p>
            </div>
          </div>

          {/* CTA note */}
          <div className="text-sm text-gray-500 border-t pt-6">
            For inquiries, partnerships, or support, please contact us via email
            or phone.
          </div>
        </div>
      </div>
    </section>
  );
}