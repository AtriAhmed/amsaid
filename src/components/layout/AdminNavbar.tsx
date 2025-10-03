"use client";

import UserDropdown from "@/components/admin/navbar/UserDropdown";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAppProvider } from "@/contexts/AppProvider";

export default function AdminNavbar() {
  const t = useTranslations("common");
  const { setShowMobileSidebar } = useAppProvider();

  return (
    <header className="fixed h-[60px] flex items-center top-0 w-full bg-background/60 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="size-6 sm:size-8 text-primary" />
            <span className="text-sm sm:text-xl font-bold text-foreground">
              {t("islamic preacher")}
            </span>
          </Link>

          <div className="flex items-center space-x-2">
            <UserDropdown />
            <LocaleSwitcher />
            <Button
              variant="outline"
              size="sm"
              className="sm:hidden"
              onClick={() => {
                setShowMobileSidebar((prev) => !prev);
              }}
            >
              <Menu className="size-3" />
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
