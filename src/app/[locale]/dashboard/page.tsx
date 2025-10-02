import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <pre className="mt-4 bg-gray-100 p-3 rounded text-sm">
        {JSON.stringify(session, null, 2)}
      </pre>
      <SignOutButton />
    </main>
  );
}
