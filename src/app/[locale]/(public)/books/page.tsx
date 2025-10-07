"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import axios from "axios";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { BookOpen, RefreshCw, AlertTriangle } from "lucide-react";
import BooksSearch from "@/components/books/BooksSearch";
import BooksGrid from "@/components/books/BooksGrid";
import { Book } from "@/types";

interface BooksResponse {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Fetcher function for SWR
const fetcher = async (
  page: number,
  limit: number,
  search: string,
  categoryId: string,
  language: string,
  sortBy: string,
  sortOrder: string
) => {
  const params: any = {
    page,
    limit,
    active: "true", // Only fetch active books for public view
    sortBy,
    sortOrder,
  };

  if (search) params.search = search;
  if (categoryId) params.categoryId = categoryId;
  if (language) params.language = language;

  const res = await axios.get<BooksResponse>("/api/books", { params });
  return res.data;
};

const BooksPage = () => {
  const t = useTranslations("common");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const limit = 20; // Show more books per page for public view

  // Debounce search to avoid excessive API calls
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [debouncedCategoryId] = useDebounce(categoryId, 300);
  const [debouncedLanguage] = useDebounce(language, 300);
  const [debouncedSortBy] = useDebounce(sortBy, 300);
  const [debouncedSortOrder] = useDebounce(sortOrder, 300);

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR<BooksResponse>(
    [
      "books",
      currentPage,
      limit,
      debouncedSearch,
      debouncedCategoryId,
      debouncedLanguage,
      debouncedSortBy,
      debouncedSortOrder,
    ],
    () =>
      fetcher(
        currentPage,
        limit,
        debouncedSearch,
        debouncedCategoryId,
        debouncedLanguage,
        debouncedSortBy,
        debouncedSortOrder
      ),
    {
      keepPreviousData: true,
    }
  );

  const setPage = function (page: number) {
    setCurrentPage(page);
    const top = document.getElementById("top");
    if (!top) return;

    const offsetTop = top.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: offsetTop - 70, behavior: "instant" });
  };

  const setSearch = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const setCategoryFilter = useCallback((category: string) => {
    setCategoryId(category);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const setLanguageFilter = useCallback((lang: string) => {
    setLanguage(lang);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const setSortByFilter = useCallback((sort: string) => {
    setSortBy(sort);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  const setSortOrderFilter = useCallback((order: "asc" | "desc") => {
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  const handleRetry = () => {
    revalidate();
  };

  const books = data?.books || [];
  const pagination = {
    currentPage: data?.pagination.page || 1,
    totalPages: data?.pagination.totalPages || 1,
    total: data?.pagination.totalCount || 0,
    limit: data?.pagination.limit || limit,
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("islamic library")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("valuable islamic books description")}
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            {pagination.total > 0 && (
              <span>
                {t("showing")} {(currentPage - 1) * limit + 1} -{" "}
                {Math.min(currentPage * limit, pagination.total)} {t("of")}{" "}
                {pagination.total} {t("books")}
              </span>
            )}
          </div>
        </div>

        <div id="top"></div>

        <BooksSearch
          searchTerm={searchTerm}
          onSearchChange={setSearch}
          categoryId={categoryId}
          onCategoryChange={setCategoryFilter}
          language={language}
          onLanguageChange={setLanguageFilter}
          sortBy={sortBy}
          onSortByChange={setSortByFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrderFilter}
          className="mb-2"
        />

        {/* Books Card - Always show title */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              {t("available books")}
              {!isLoading && !error && pagination.total > 0 && (
                <span className="text-muted-foreground text-base font-normal">
                  ({pagination.total})
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {t("explore our collection of islamic books")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <p className="text-muted-foreground">{t("loading")}</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {t("oops something went wrong")}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t("error loading books")}
                </p>
                <Button
                  onClick={() => revalidate()}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs"
                >
                  <RefreshCw className="h-2 w-2" />
                  {t("retry")}
                </Button>
              </div>
            ) : (
              <>
                <BooksGrid books={books} isLoading={isLoading} />

                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BooksPage;
