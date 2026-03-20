
import NavBar from "@/components/Landing/NavBar";
import Products from "./Products";
import Contact from "./Contact";
import { Hero } from "./Hero";
import AboutUs from "./AboutUs";

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-white min-h-screen items-center justify-center ">
      <NavBar />
      <section
        id="home"
        className="min-h-screen w-full flex items-center justify-center"
      >
        <Hero />
      </section>
      <section
        id="contact"
        className="min-h-screen flex items-center justify-center"
      >
        <Contact />
      </section>
    </div>
  );
}
