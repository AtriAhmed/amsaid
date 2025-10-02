import { Button } from "@/components/ui/button";
import { BookOpen, Menu } from "lucide-react";
import Link from "next/link";
import LocaleSwitcher from "../LocaleSwitcher";
import { useTranslations } from "next-intl";

export default function Navbar() {
  const t = useTranslations("common");
  return (
    <header className="fixed h-[60px] flex items-center top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              {t("islamic preacher")}
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="#home"
              className="text-foreground hover:text-primary transition-smooth"
            >
              {t("home")}
            </Link>
            <Link
              href="#videos"
              className="text-foreground hover:text-primary transition-smooth"
            >
              {t("lectures")}
            </Link>
            <Link
              href="#books"
              className="text-foreground hover:text-primary transition-smooth"
            >
              {t("books")}
            </Link>
            <Link
              href="#about"
              className="text-foreground hover:text-primary transition-smooth"
            >
              {t("about us")}
            </Link>
            <Link
              href="#contact"
              className="text-foreground hover:text-primary transition-smooth"
            >
              {t("contact us")}
            </Link>
            <LocaleSwitcher />
          </div>

          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
