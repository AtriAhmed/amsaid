import { Button } from "@/components/ui/button";
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Youtube, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8 text-accent" />
              <span className="text-2xl font-bold">الداعية الإسلامي</span>
            </div>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed max-w-md">
              منصة إسلامية تعليمية تقدم محتوى إسلامي أصيل من خلال المحاضرات والكتب
              الإسلامية القيمة. نهدف إلى نشر العلم الشرعي لجميع المسلمين.
            </p>
            
            <div className="flex space-x-4">
              <Button variant="heroSecondary" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="heroSecondary" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="heroSecondary" size="icon">
                <Youtube className="h-4 w-4" />
              </Button>
              <Button variant="heroSecondary" size="icon">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="#videos" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  المحاضرات
                </a>
              </li>
              <li>
                <a href="#books" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  الكتب
                </a>
              </li>
              <li>
                <a href="#about" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  من نحن
                </a>
              </li>
              <li>
                <a href="#contact" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  تواصل معنا
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-accent mr-3" />
                <span className="text-primary-foreground/80">info@islamicda3ya.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-accent mr-3" />
                <span className="text-primary-foreground/80">+966 50 123 4567</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-accent mr-3" />
                <span className="text-primary-foreground/80">الرياض، المملكة العربية السعودية</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/60">
            © 2024 الداعية الإسلامي. جميع الحقوق محفوظة. تم التطوير بحب لخدمة الإسلام والمسلمين.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;