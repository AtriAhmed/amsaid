import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  BookOpen,
  Calendar,
  User,
  Tag as TagIcon,
  Globe,
  FileText,
  HardDrive,
} from "lucide-react";
import { Book } from "@/types";
import { getBookMediaUrl, getMediaUrl } from "@/lib/utils";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DownloadButton from "../../../../../components/books/[id]/DownloadButton";
import { LANGUAGES, LANGUAGES_OBJ } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

// Server-side function to fetch book data
async function getBook(id: string): Promise<Book | null> {
  try {
    const bookId = parseInt(id, 10);
    if (isNaN(bookId) || bookId < 1) {
      return null;
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return book;
  } catch (error) {
    console.error("Error fetching book:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    return {
      title: "Book Not Found",
    };
  }

  return {
    title: `${book.title} - ${book.author?.name || "Unknown Author"}`,
    description: book.description,
    openGraph: {
      title: book.title,
      description: book.description,
      images: book.coverPhoto ? [getMediaUrl(book.coverPhoto)] : [],
    },
  };
}

export default async function BookPage({ params }: PageProps) {
  const { id, locale } = await params;
  const book = await getBook(id);
  const t = await getTranslations("common");

  if (!book) {
    notFound();
  }

  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    }
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/books" className="hover:text-foreground">
              {t("books")}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-xs">
              {book.title}
            </span>
          </div>
        </nav> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Main Content - PDF Reader */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                    {t("read online")}
                  </CardTitle>
                  <DownloadButton
                    bookId={book.id}
                    bookTitle={book.title}
                    className="gap-2"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                    {t("download pdf")}
                  </DownloadButton>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-[4/5] bg-gray-100 rounded-b-lg overflow-hidden">
                  <iframe
                    src={getBookMediaUrl(book.id)}
                    className="w-full h-full border-0"
                    title={book.title}
                    loading="lazy"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Book Information */}
          <div className="space-y-2">
            {/* Book Cover and Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Cover Photo */}
                  {book.coverPhoto && (
                    <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={getMediaUrl(book.coverPhoto)}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Title and Author */}
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-foreground leading-tight">
                      {book.title}
                    </h1>
                    {book.author && (
                      <p className="text-lg text-muted-foreground">
                        {book.author.name}
                      </p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-foreground">
                        {book.downloads.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">
                        {t("downloads")}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-foreground">
                        {book.pages}
                      </div>
                      <div className="text-muted-foreground">{t("pages")}</div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <DownloadButton
                    bookId={book.id}
                    bookTitle={book.title}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Download className="h-5 w-5" />
                    {t("download pdf")}
                  </DownloadButton>
                </div>
              </CardContent>
            </Card>

            {/* Book Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t("book information")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Author */}
                {book.author && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">
                        {book.author.name}
                      </div>
                      {book.author.bio && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {book.author.bio}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Category */}
                {book.category && (
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("category")}
                      </div>
                      <div className="font-medium text-foreground">
                        {book.category.name}
                      </div>
                    </div>
                  </div>
                )}

                {/* Language */}
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("language")}
                    </div>
                    <div className="font-medium text-foreground">
                      {LANGUAGES_OBJ[book.language]?.label
                        ? t(LANGUAGES_OBJ[book.language]?.label)
                        : book.language}
                    </div>
                  </div>
                </div>

                {/* File Size */}
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      File Size
                    </div>
                    <div className="font-medium text-foreground">
                      {formatFileSize(book.size)}
                    </div>
                  </div>
                </div>

                {/* Publication Date */}
                {book.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t("date added")}
                      </div>
                      <div className="font-medium text-foreground">
                        {new Date(book.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {book.tags && book.tags.length > 0 && (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TagIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {t("tags")}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {book.tags.map((tag: { id: number; name: string }) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {book.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t("book description")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {book.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
