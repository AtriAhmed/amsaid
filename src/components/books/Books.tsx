"use client";

import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { getBookMediaUrl } from "@/lib/utils";
import { Book } from "@/types";
import { useState } from "react";
import BookDialog from "./BookDialog";
import BookCard from "./BookCard";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface BooksProps {
  books: Book[];
}

export default function Books({ books }: BooksProps) {
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

  return (
    <section id="books" className="py-20 bg-background">
      <div className="mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("islamic library")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("valuable islamic books description")}
          </p>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-muted p-6">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("no books available")}
                </h3>
                <p className="text-muted-foreground">
                  {t("check_back_later")}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onBookClick={handleBookClick}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button asChild variant="default" size="lg">
            <Link href="/books">{t("view all books")}</Link>
          </Button>
        </div>
      </div>

      <BookDialog
        book={readDialog.book}
        isOpen={readDialog.open}
        onOpenChange={handleModalClose}
      />
    </section>
  );
}
