import { Button } from "@/components/ui/button";
import { BookOpen, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">الداعية الإسلامي</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#home" className="text-foreground hover:text-primary transition-smooth">
              الرئيسية
            </a>
            <a href="#videos" className="text-foreground hover:text-primary transition-smooth">
              المحاضرات
            </a>
            <a href="#books" className="text-foreground hover:text-primary transition-smooth">
              الكتب
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-smooth">
              من نحن
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-smooth">
              تواصل معنا
            </a>
          </div>
          
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;