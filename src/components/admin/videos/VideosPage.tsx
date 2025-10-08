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
import { Play, RefreshCw, AlertTriangle } from "lucide-react";
import VideosSearch from "@/components/videos/VideosSearch";
import VideosGrid from "@/components/videos/VideosGrid";
import { Video } from "@/types";

interface VideosResponse {
  videos: Video[];
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
    active: "true", // Only fetch active videos for public view
    sortBy,
    sortOrder,
  };

  if (search) params.search = search;
  if (categoryId && categoryId !== "none") params.categoryId = categoryId;
  if (language && language !== "none") params.language = language;

  const res = await axios.get<VideosResponse>("/api/videos", { params });
  return res.data;
};

type VideosPageProps = {
  initialVideos: VideosResponse;
};

export default function VideosPage({ initialVideos }: VideosPageProps) {
  const t = useTranslations("common");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const limit = 20; // Show more videos per page for public view

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
  } = useSWR<VideosResponse>(
    [
      "videos",
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
      fallbackData: initialVideos,
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

  const videos = data?.videos || [];
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
              <Play className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("lectures and sermons")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("selected islamic lectures description")}
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            {pagination.total > 0 && (
              <span>
                {t("showing")} {(currentPage - 1) * limit + 1} -{" "}
                {Math.min(currentPage * limit, pagination.total)} {t("of")}{" "}
                {pagination.total} {t("videos")}
              </span>
            )}
          </div>
        </div>

        <div id="top"></div>

        <VideosSearch
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

        {/* Videos Card - Always show title */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Play className="h-6 w-6 text-primary" />
              {t("available videos")}
              {!isLoading && !error && pagination.total > 0 && (
                <span className="text-muted-foreground text-base font-normal">
                  ({pagination.total})
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {t("explore our collection of islamic lectures")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && !videos?.length ? (
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
                  {t("error loading videos")}
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
                <VideosGrid videos={videos} isLoading={false} />

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
}
