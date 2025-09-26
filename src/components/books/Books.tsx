import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Download, FileText } from "lucide-react";

const Books = () => {
  const books = [
    {
      id: 1,
      title: "رياض الصالحين",
      author: "الإمام النووي",
      description: "مجموعة من الأحاديث النبوية الشريفة المنتقاة في موضوعات مختلفة",
      pages: "450",
      size: "2.5 MB",
      cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&crop=faces"
    },
    {
      id: 2,
      title: "تفسير القرآن الكريم",
      author: "ابن كثير",
      description: "تفسير شامل وموجز لآيات القرآن الكريم بأسلوب واضح ومفهوم",
      pages: "680",
      size: "4.2 MB",
      cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop&crop=faces"
    },
    {
      id: 3,
      title: "الأذكار المأثورة",
      author: "الإمام النووي",
      description: "كتاب جامع للأذكار والدعوات المأثورة من السنة النبوية",
      pages: "320",
      size: "1.8 MB",
      cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop&crop=faces"
    }
  ];

  return (
    <section id="books" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            المكتبة الإسلامية
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            مجموعة قيمة من الكتب الإسلامية للقراءة والتحميل المجاني
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <Card key={book.id} className="group hover:shadow-elegant transition-smooth overflow-hidden">
              <div className="relative">
                <img 
                  src={book.cover} 
                  alt={book.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-smooth"
                />
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                  PDF
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {book.title}
                </h3>
                <p className="text-primary font-medium mb-2">
                  {book.author}
                </p>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {book.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <FileText className="mr-1 h-4 w-4" />
                    {book.pages} صفحة
                  </div>
                  <div>
                    {book.size}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="flex-1">
                    <BookOpen className="mr-2 h-4 w-4" />
                    قراءة أونلاين
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    تحميل PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="default" size="lg">
            عرض جميع الكتب
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Books;