import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/[locale]/globals.css";
import Providers from "@/contexts/providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { hasLocale, Locale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(
  props: Omit<LayoutProps<"/[locale]">, "children">
) {
  const { locale } = await props.params;

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "common",
  });

  return {
    title: t("islamic preacher"),
    description: t("page description"),
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const session = await getServerSession(authOptions);

  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} data-scroll-behavior="smooth" dir={dir}>
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
