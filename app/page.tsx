import AboutUs from "@/components/Landing/AboutUs";
import { Hero } from "@/components/Landing/Hero";
import NavBar from "@/components/Landing/NavBar";
import Products from "../components/Landing/Products";
import Contact from "../components/Landing/Contact";

export default function Home() {
  return (
    <div className="flex flex-col bg-white min-h-screen items-center justify-center ">
      <NavBar />
      <section
        id="home"
        className="min-h-screen flex items-center justify-center"
      >
        <Hero />
      </section>
     
      <section
        id="contact"
        className="min-h-screen w-full flex items-center justify-center"
      >
        <Contact />
      </section>
    </div>
  );
}
