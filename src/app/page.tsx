import About from "@/components/about/About";
import Books from "@/components/books/Books";
import Hero from "@/components/home/Hero";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Videos from "@/components/videos/Videos";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Videos />
      <Books />
      <About />
      <Footer />
    </div>
  );
}
