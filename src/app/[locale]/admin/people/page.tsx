"use client";

import { useState, useMemo, useCallback } from "react";
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
import { Pagination } from "@/components/ui/pagination";
import PersonDialog from "@/components/admin/people/PersonDialog";
import PeopleTable from "@/components/admin/people/PeopleTable";
import PeopleSearch from "@/components/admin/people/PeopleSearch";

interface Person {
  id: number;
  name: string;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    books: number;
    videos: number;
  };
}

interface PeopleResponse {
  data: Person[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// axios-based fetcher for SWR when using an array key like ["people", queryParams]
const fetcher = async (
  _key: string,
  page: number,
  limit: number,
  search: string
) => {
  const res = await axios.get<PeopleResponse>("/api/people", {
    params: {
      page,
      limit,
      search,
    },
  });
  return res.data;
};

export default function PeoplePage() {
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
  } = useSWR<PeopleResponse>(
    ["people", currentPage, limit, debouncedSearch],
    () => fetcher("people", currentPage, limit, debouncedSearch)
  );

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setSearch = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handlePersonCreated = () => {
    revalidate();
  };

  const handlePersonDeleted = () => {
    revalidate();
  };

  const handlePersonUpdated = () => {
    revalidate();
  };

  const people = data?.data || [];
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
            <h1 className="text-3xl font-bold mb-2">{t("manage people")}</h1>
            <p className="text-muted-foreground">
              {t("add edit delete people")}
            </p>
          </div>
          <div className="ms-auto">
            <PersonDialog onPersonCreated={handlePersonCreated} />
          </div>
        </div>

        {/* Search and Filters */}
        <PeopleSearch searchTerm={searchTerm} onSearchChange={setSearch} />

        {/* People Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("available people")} ({pagination.total})
            </CardTitle>
            <CardDescription>{t("all people in system")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t("loading")}</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">
                  {t("error loading people")}:{" "}
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
                <PeopleTable
                  people={people}
                  onPersonDeleted={handlePersonDeleted}
                  onPersonUpdated={handlePersonUpdated}
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
}
