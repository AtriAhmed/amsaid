import About from "@/components/about/About";
import Books from "@/components/books/Books";
import Hero from "@/components/home/Hero";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Videos from "@/components/videos/Videos";

export default function Home() {
  return (
     <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Videos />
      <Books />
      <About />
      <Footer />
    </div>
  );
}