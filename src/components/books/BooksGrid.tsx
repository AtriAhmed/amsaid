"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { getBookMediaUrl } from "@/lib/utils";
import { Book } from "@/types";
import { useState } from "react";
import BookDialog from "./BookDialog";
import BookCard from "./BookCard";
import { useTranslations } from "next-intl";

interface BooksGridProps {
  books: Book[];
  isLoading?: boolean;
}

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
          <BookCard
            key={book.id}
            book={book}
            onBookClick={handleBookClick}
            onDownload={handleDownload}
          />
        ))}
      </div>

      <BookDialog
        book={readDialog.book}
        isOpen={readDialog.open}
        onOpenChange={handleModalClose}
      />
    </>
  );
}
