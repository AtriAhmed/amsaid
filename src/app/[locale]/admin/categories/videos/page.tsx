"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import CategoryDialog from "@/components/admin/categories/videos/CategoryDialog";
import CategoriesTable from "@/components/admin/categories/videos/CategoriesTable";
import CategoriesSearch from "@/components/admin/categories/videos/CategoriesSearch";

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    videos: number;
  };
}

interface CategoriesResponse {
  data: Category[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// axios-based fetcher for SWR when using an array key like ["videos-categories", queryParams]
const fetcher = async (page: number, limit: number, search: string) => {
  const res = await axios.get<CategoriesResponse>("/api/categories/videos", {
    params: {
      page,
      limit,
      search,
    },
  });
  return res.data;
};

export default function CategoriesPage() {
  const t = useTranslations("common");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const limit = 10;

  // Debounce search to avoid excessive API calls
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR<CategoriesResponse>(
    ["videos-categories", currentPage, limit, debouncedSearch],
    () => fetcher(currentPage, limit, debouncedSearch)
  );

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setSearch = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleCategoryCreated = () => {
    revalidate();
  };

  const handleCategoryDeleted = () => {
    revalidate();
  };

  const handleCategoryUpdated = () => {
    revalidate();
  };

  const categories = data?.data || [];
  const pagination = {
    currentPage: data?.page || 1,
    totalPages: data?.pages || 1,
    total: data?.total || 0,
    limit: data?.limit || limit,
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex gap-2 justify-between items-center mb-8 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t("manage video categories")}
            </h1>
            <p className="text-muted-foreground">
              {t("add edit delete video categories")}
            </p>
          </div>
          <div className="ms-auto">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("add new category")}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <CategoriesSearch searchTerm={searchTerm} onSearchChange={setSearch} />

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("available video categories")} ({pagination.total})
            </CardTitle>
            <CardDescription>
              {t("all video categories in system")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t("loading")}</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">
                  {t("error loading categories")}:{" "}
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
                <CategoriesTable
                  categories={categories}
                  onCategoryDeleted={handleCategoryDeleted}
                  onCategoryUpdated={handleCategoryUpdated}
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

        {/* Create Category Dialog */}
        <CategoryDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCategoryCreated={handleCategoryCreated}
        />
      </div>
    </div>
  );
}
