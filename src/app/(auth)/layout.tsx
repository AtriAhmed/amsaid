import AdminNavbar from "@/components/layout/AdminNavbar";
import Private from "@/components/Private";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/admin");
  }

  return (
    <Private guestOnly redirectTo="/admin">
      <AdminNavbar />
      <div className="pt-[60px]">{children}</div>
    </Private>
  );
}
