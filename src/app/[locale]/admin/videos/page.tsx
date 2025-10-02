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
import { Plus } from "lucide-react";
import Link from "next/link";
import VideosSearch from "@/components/admin/videos/VideosSearch";
import VideosTable from "@/components/admin/videos/VideosTable";

interface Speaker {
  id: number;
  name: string;
  bio: string | null;
}

interface Category {
  id: number;
  name: string;
}

interface Place {
  id: number;
  name: string;
  address: string | null;
}

interface Tag {
  id: number;
  name: string;
}

interface Video {
  id: number;
  title: string;
  description: string;
  speakers: Speaker[];
  category: Category;
  place: Place | null;
  language: string;
  poster: string | null;
  url: string;
  duration: number;
  views: number;
  active: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

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
const fetcher = async (
  _key: string,
  page: number,
  limit: number,
  search: string
) => {
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
    () => fetcher("videos", currentPage, limit, debouncedSearch)
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
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t("loading")}</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">
                  {t("error loading videos")}:{" "}
                  {(error as any)?.message ?? t("unknown error occurred")}
                </p>
                {/* Optionally add a retry button */}
                <div className="mt-4">
                  <button
                    onClick={() => revalidate()}
                    className="inline-flex items-center px-3 py-1.5 text-sm rounded-md border"
                  >
                    {t("retry")}
                  </button>
                </div>
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
