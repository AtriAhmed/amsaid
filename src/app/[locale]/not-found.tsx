import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function NotFound() {
  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center h-screen bg-[#014c44] pt-[60px]">
        <img
          src="/assets/not-found.webp"
          className="w-full h-full object-contain"
        />
      </div>
      <Footer />
    </div>
  );
}
