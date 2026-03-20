
const AboutUs = () => {
  return (
    <section
      id="About"
      className="w-full min-h-screen flex items-center bg-[#F8D7D7]/20 px-4 md:px-20"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div className="relative md:h-130 h-100 w-full">
          <img 
            src="/Lakadel2.png"
            alt="Our brand"
            className="w-full object-cover h-full rounded-sm"
          />
          <div className=" md:flex absolute inset-0 md:border border-0 border-b border-[#B10E0E] pointer-events-none" />
        </div>

        <div className=""> 
          <span className="block text-xs tracking-[0.35em] uppercase text-gray-500 mb-6">
            Since 2025
          </span>

          <h2 className="text-4xl md:text-6xl font-serif font-light text-[#B10E0E] leading-tight md:mb-8 mb-4">
            Elegance, <br /> Tailored for You
          </h2>

          <p className="text-gray-700 md:text-lg text-base leading-relaxed mb-6 max-w-xl">
            Our brand is built on timeless design, refined craftsmanship, and an
            uncompromising attention to detail. Every piece is thoughtfully
            created to elevate your presence — effortlessly.
          </p>

          <p className="text-gray-700 md:text-lg text-base leading-relaxed mb-10 max-w-xl">
            We don’t follow trends. We define enduring style, blending modern
            silhouettes with classic luxury for those who value subtle
            excellence.
          </p>

          <button className="border border-[#B10E0E] px-10 py-4 text-sm tracking-widest cursor-pointer uppercase hover:bg-[#B10E0E] hover:text-white text-[#B10E0E] transition duration-300">
            Discover More
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
