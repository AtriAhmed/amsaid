"use client";

import { MainLoader } from "@/components/loaders";
import { useSession } from "next-auth/react";
import { notFound, useRouter } from "next/navigation";
import { useEffect } from "react";

type PrivateProps = {
  children: React.ReactNode;
  /** Roles that are allowed to access this page */
  guestOnly?: boolean;
  /** Where to redirect if unauthorized */
  redirectTo?: string;
};

export default function Private({
  children,
  guestOnly = false,
  redirectTo = "/",
}: Readonly<PrivateProps>) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Loading state → don’t redirect yet
    if (status === "loading") return;

    // Guest-only pages
    if (guestOnly) {
      if (session) {
        router.push(redirectTo);
      }
      return;
    }

    // Auth required
    if (!session) {
      router.push(redirectTo);
      return;
    }
  }, [session, status, guestOnly, router]);

  // Show loader while checking
  if (status === "loading") {
    return (
      <div className="flex h-[calc(100vh-55px)] w-full items-center justify-center">
        <MainLoader />
      </div>
    );
  }

  // Guest-only: show children if no session
  if (guestOnly && !session) {
    return children;
  }

  // Authenticated with valid role
  if (session) {
    return children;
  }

  // Otherwise → nothing (will redirect)
  return null;
}
