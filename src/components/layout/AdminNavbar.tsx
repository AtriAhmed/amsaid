import { Button } from "@/components/ui/button";
import { BookOpen, Menu } from "lucide-react";
import Link from "next/link";

export default function AdminNavbar() {
  return (
    <header className="fixed h-[60px] flex items-center top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              الداعية الإسلامي
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/admin"
              className="text-foreground hover:text-primary transition-smooth"
            >
              الرئيسية
            </Link>
            <Link
              href="/admin/books"
              className="text-foreground hover:text-primary transition-smooth"
            >
              الكتب
            </Link>
            <Link
              href="/admin/videos"
              className="text-foreground hover:text-primary transition-smooth"
            >
              المحاضرات
            </Link>
          </div>

          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
