import AdminNavbar from "@/components/layout/AdminNavbar";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Private from "@/components/Private";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    notFound();
  }

  return (
    <Private>
      <AdminNavbar />
      <AdminSidebar />
      <div className="pt-[60px] sm:pl-[200px] rtl:sm:pr-[200px] rtl:sm:pl-0">
        {children}
      </div>
    </Private>
  );
}
