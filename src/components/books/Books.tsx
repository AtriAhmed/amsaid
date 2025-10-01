"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Download, FileText } from "lucide-react";
import { getBookMediaUrl, getMediaUrl } from "@/lib/utils";
import Image from "next/image";
import { Book } from "@/types";
import { useState } from "react";
import BookModal from "./BookDialog";

interface BooksProps {
  books: Book[];
}

// Helper function to format file size
const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

const Books = ({ books }: BooksProps) => {
  const [readDialog, setReadDialog] = useState<{
    open: boolean;
    book: Book | null;
  }>({
    open: false,
    book: null,
  });

  const handleBookClick = (book: Book) => {
    setReadDialog({ open: true, book });
  };

  const handleModalClose = (open: boolean) => {
    setReadDialog({ open, book: null });
  };

  const handleDownload = (book: Book) => {
    const link = document.createElement("a");
    link.href = getBookMediaUrl(book.id);
    link.download = `${book.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="books" className="py-20 bg-background">
      <div className="mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            المكتبة الإسلامية
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            مجموعة قيمة من الكتب الإسلامية للقراءة والتحميل المجاني
          </p>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">لا توجد كتب متاحة</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map((book) => (
              <Card
                key={book.id}
                className="flex flex-col group hover:shadow-elegant hover:shadow-lg hover:scale-[1.02] transition-smooth overflow-hidden duration-200"
              >
                <div
                  className="relative h-60 overflow-hidden cursor-pointer"
                  onClick={() => handleBookClick(book)}
                >
                  <Image
                    src={
                      book.coverPhoto
                        ? getMediaUrl(book.coverPhoto)
                        : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&crop=faces"
                    }
                    fill
                    alt={book.title}
                    className="object-cover group-hover:scale-105 transition-smooth duration-100 blur-md"
                  />
                  <Image
                    src={
                      book.coverPhoto
                        ? getMediaUrl(book.coverPhoto)
                        : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&crop=faces"
                    }
                    fill
                    alt={book.title}
                    className="object-contain group-hover:scale-105 transition-smooth duration-100"
                  />
                  <div className="absolute inset-0 bg-primary/20 hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center duration-200">
                    <Button variant="hero" size="lg">
                      <BookOpen className="mr-2 h-6 w-6" />
                      قراءة الآن
                    </Button>
                  </div>
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                    PDF
                  </div>
                  {book.category && (
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {book.category.name}
                    </div>
                  )}
                </div>

                <CardContent className="grow flex flex-col px-6 pt-2 pb-4">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {book.title}
                  </h3>
                  <p className="text-primary font-medium">
                    {book.author?.name}
                  </p>
                  <p className="text-muted-foreground mb-2 line-clamp-2">
                    {book.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 mt-auto">
                    <div className="flex items-center">
                      <FileText className="mr-1 h-4 w-4" />
                      {book.pages} صفحة
                    </div>
                    <div>{formatFileSize(book.size)}</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 py-1.5"
                      onClick={() => handleBookClick(book)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      قراءة أونلاين
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 py-1.5"
                      onClick={() => handleDownload(book)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      تحميل PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="default" size="lg">
            عرض جميع الكتب
          </Button>
        </div>
      </div>

      <BookModal
        book={readDialog.book}
        isOpen={readDialog.open}
        onOpenChange={handleModalClose}
      />
    </section>
  );
};

export default Books;
