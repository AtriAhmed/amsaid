import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/[locale]/globals.css";
import Providers from "@/components/providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextIntlClientProvider } from "next-intl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "الداعية الإسلامي",
  description:
    "منصة إسلامية تعليمية تحتوي على مجموعة من المحاضرات والكتب الإسلامية القيمة لنشر العلم والهداية",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <Providers session={session}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
