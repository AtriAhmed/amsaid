"use client";
import AppProvider from "@/contexts/AppProvider";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

type ProvidersProps = {
  children: React.ReactNode;
  session: Session | null;
};

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <AppProvider>
      <SessionProvider session={session}>{children}</SessionProvider>;
    </AppProvider>
  );
}
