"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BookOpen, Menu } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import LocaleSwitcher from "../LocaleSwitcher";
import { useTranslations } from "next-intl";

interface NavLink {
  href: string;
  labelKey: string;
}

const NAV_LINKS: NavLink[] = [
  { href: "/#home", labelKey: "home" },
  { href: "/videos", labelKey: "lectures" },
  { href: "/books", labelKey: "books" },
  { href: "/#about", labelKey: "about us" },
  { href: "/#contact", labelKey: "contact us" },
];

export default function Navbar() {
  const t = useTranslations("common");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname() || "/";

  // Close mobile menu when pathname changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  return (
    <header className="fixed h-[60px] flex items-center top-0 w-full bg-background/60 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-sm sm:text-xl font-bold text-foreground">
              {t("islamic preacher")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-primary transition-smooth"
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <LocaleSwitcher />
          </div>

          {/* Mobile Menu Button & Sheet */}
          <div className="md:hidden">
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-[300px] p-0">
                <SheetHeader className="p-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <SheetTitle className="text-lg font-semibold">
                      {t("islamic preacher")}
                    </SheetTitle>
                  </div>
                </SheetHeader>

                <div className="p-4">
                  <nav className="space-y-2">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-primary/25 transition-smooth duration-200"
                      >
                        {t(link.labelKey)}
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-4">
                    <LocaleSwitcher
                      compact={false}
                      buttonClassName="justify-start w-full hover:bg-primary/25 hover:text-foreground duration-200"
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
