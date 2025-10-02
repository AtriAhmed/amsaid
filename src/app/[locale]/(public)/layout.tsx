import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Navbar />
      <main className="pt-[60px]">{children}</main>
      <Footer />
    </div>
  );
}
