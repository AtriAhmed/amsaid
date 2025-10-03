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
import CreateUserDialog from "@/components/admin/users/CreateUserDialog";
import UsersTable from "@/components/admin/users/UsersTable";
import UsersSearch from "@/components/admin/users/UsersSearch";
import { Role, User } from "@/types";
import { useSession } from "next-auth/react";

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// axios-based fetcher for SWR when using an array key like ["users", queryParams]
const fetcher = async (
  _key: string,
  page: number,
  limit: number,
  search: string
) => {
  const res = await axios.get<UsersResponse>("/api/users", {
    params: {
      page,
      limit,
      search,
    },
  });
  return res.data;
};

export default function UsersPage() {
  const { data: session } = useSession();
  const user = session?.user;

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
  } = useSWR<UsersResponse>(
    ["users", currentPage, limit, debouncedSearch],
    () => fetcher("users", currentPage, limit, debouncedSearch)
  );

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setSearch = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleUserCreated = () => {
    revalidate();
  };

  const handleUserDeleted = () => {
    revalidate();
  };

  const handleUserUpdated = () => {
    revalidate();
  };

  const users = data?.users || [];
  const pagination = {
    currentPage: data?.pagination?.page || 1,
    totalPages: data?.pagination?.pages || 1,
    total: data?.pagination?.total || 0,
    limit: data?.pagination?.limit || limit,
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex gap-2 justify-between items-center mb-8 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("manage users")}</h1>
            <p className="text-muted-foreground">
              {t("add edit delete users")}
            </p>
          </div>
          <div className="ms-auto">
            <CreateUserDialog onUserCreated={handleUserCreated} />
          </div>
        </div>

        {/* Search and Filters */}
        <UsersSearch searchTerm={searchTerm} onSearchChange={setSearch} />

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("available users")} ({pagination.total})
            </CardTitle>
            <CardDescription>{t("all users in system")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t("loading")}</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">
                  {t("error loading users")}:{" "}
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
                <UsersTable
                  users={users}
                  onUserDeleted={handleUserDeleted}
                  onUserUpdated={handleUserUpdated}
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
