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
import { Plus, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import VideosSearch from "@/components/admin/videos/VideosSearch";
import VideosTable from "@/components/admin/videos/VideosTable";
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

// axios-based fetcher for SWR when using an array key like ["videos", queryParams]
const fetcher = async (page: number, limit: number, search: string) => {
  const res = await axios.get<VideosResponse>("/api/videos", {
    params: {
      page,
      limit,
      search,
    },
  });
  return res.data;
};

const VideosManagement = () => {
  const t = useTranslations("common");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;

  // Debounce search to avoid excessive API calls
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR<VideosResponse>(
    ["videos", currentPage, limit, debouncedSearch],
    () => fetcher(currentPage, limit, debouncedSearch)
  );

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setSearch = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleVideoDeleted = () => {
    revalidate();
  };

  const handleVideoUpdated = () => {
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t("videos management")}
            </h1>
            <p className="text-muted-foreground">
              {t("add edit delete available videos")}
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/videos/add" className="ms-auto">
              <Plus className="w-4 h-4 ml-2" />
              {t("add new video")}
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <VideosSearch searchTerm={searchTerm} onSearchChange={setSearch} />

        {/* Videos Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("available videos")} ({pagination.total})
            </CardTitle>
            <CardDescription>{t("all videos in system")}</CardDescription>
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
                <VideosTable
                  videos={videos}
                  onVideoDeleted={handleVideoDeleted}
                  onVideoUpdated={handleVideoUpdated}
                />

                {pagination.totalPages > 1 && (
                  <div className="mt-6">
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

export default VideosManagement;
