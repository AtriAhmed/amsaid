"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { BookOpen, Menu } from "lucide-react";
import UserDropdown from "@/components/admin/navbar/UserDropdown";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useAppProvider } from "@/contexts/AppProvider";

interface NavLink {
  href: string;
  labelKey: string;
}

const LINKS: NavLink[] = [
  { href: "/admin", labelKey: "home" },
  { href: "/admin/categories/books", labelKey: "book categories" },
  { href: "/admin/books", labelKey: "books" },
  { href: "/admin/categories/videos", labelKey: "video categories" },
  { href: "/admin/videos", labelKey: "videos" },
  { href: "/admin/users", labelKey: "users" },
  { href: "/admin/people", labelKey: "people" },
  { href: "/admin/tags", labelKey: "tags" },
];

function NavItem({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        `block px-3 py-2 rounded-md text-sm font-medium transition-smooth ` +
        (active
          ? "bg-slate-200 text-foreground"
          : "text-foreground hover:bg-primary/25")
      }
    >
      {children}
    </Link>
  );
}

/**
 * AdminSidebar
 * - Fixed on desktop (md+): left, below the navbar (top-[60px]), fixed width (w-64)
 * - Uses a Sheet on small screens (md:hidden) with a Toggle button exported as SidebarToggle
 */
export default function AdminSidebar() {
  const t = useTranslations("common");
  const pathname = usePathname() || "/";

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden sm:flex flex-col fixed start-0 top-[60px] h-[calc(100%-60px)] w-full max-w-[200px] py-4 px-2 border-e border-border bg-background z-40"
        aria-label="Main sidebar"
      >
        <nav className="flex-1 space-y-1">
          {LINKS.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              active={pathname === link.href}
            >
              {t(link.labelKey)}
            </NavItem>
          ))}
        </nav>

        <div className="flex gap-2 mt-4">
          <UserDropdown />
          <LocaleSwitcher />
        </div>
      </aside>

      {/* Mobile Sheet (small screens) */}
      <MobileSheet links={LINKS} />
    </>
  );
}

function MobileSheet({ links }: { links: NavLink[] }) {
  const t = useTranslations("common");
  const pathname = usePathname() || "/";
  const { showMobileSidebar, setShowMobileSidebar } = useAppProvider();

  useEffect(() => {
    setShowMobileSidebar(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <Sheet open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
        <SheetContent side="left" className="w-full max-w-[300px] p-0">
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
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    `block px-3 py-2 rounded-md text-sm font-medium transition-smooth ` +
                    (pathname === link.href
                      ? "bg-muted text-foreground"
                      : "text-foreground hover:bg-primary/25")
                  }
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>

            <div className="mt-4">
              <UserDropdown />
              <div className="mt-2">
                <LocaleSwitcher />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
