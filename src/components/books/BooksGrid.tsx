"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Download, FileText } from "lucide-react";
import { getBookMediaUrl, getMediaUrl } from "@/lib/utils";
import Image from "next/image";
import { Book } from "@/types";
import { useState } from "react";
import BookModal from "./BookDialog";
import { useTranslations } from "next-intl";

interface BooksGridProps {
  books: Book[];
  isLoading?: boolean;
}

// Helper function to format file size
const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

export default function BooksGrid({ books, isLoading }: BooksGridProps) {
  const t = useTranslations("common");
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

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="h-60 bg-muted rounded-t-lg" />
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted rounded mb-2 w-3/4" />
              <div className="h-4 bg-muted rounded mb-4 w-1/2" />
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded" />
                <div className="h-8 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {t("no books found")}
        </h3>
        <p className="text-muted-foreground">
          {t("try adjusting your search or filters")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
                  {t("read now")}
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

            <CardContent className="grow flex flex-col px-6 pt-4 pb-6">
              <h3 className="text-xl font-semibold text-foreground mb-1 line-clamp-2">
                {book.title}
              </h3>
              <p className="text-primary font-medium mb-2">
                {book.author?.name}
              </p>
              <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                {book.description}
              </p>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 mt-auto">
                <div className="flex items-center">
                  <FileText className="mr-1 h-4 w-4" />
                  {book.pages} {t("pages")}
                </div>
                <div>{formatFileSize(book.size)}</div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 py-2"
                  onClick={() => handleBookClick(book)}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  {t("read online")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 py-2"
                  onClick={() => handleDownload(book)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("download pdf")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <BookModal
        book={readDialog.book}
        isOpen={readDialog.open}
        onOpenChange={handleModalClose}
      />
    </>
  );
}
