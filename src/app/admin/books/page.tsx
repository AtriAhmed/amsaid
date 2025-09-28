"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import axios from "axios";
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
import BooksSearch from "@/components/admin/books/BooksSearch";
import BooksTable from "@/components/admin/books/BooksTable";

interface Author {
  id: number;
  name: string;
  bio: string | null;
}

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Book {
  id: number;
  title: string;
  description: string;
  author: Author;
  category: Category;
  language: string;
  coverPhoto: string | null;
  fileUrl: string;
  pages: number;
  size: number;
  downloads: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

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

// axios-based fetcher for SWR when using an array key like ["books", queryParams]
const fetcher = async (
  _key: string,
  page: number,
  limit: number,
  search: string
) => {
  const res = await axios.get<BooksResponse>("/api/books", {
    params: {
      page,
      limit,
      search,
    },
  });
  return res.data;
};

const BooksManagement = () => {
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
  } = useSWR<BooksResponse>(
    ["books", currentPage, limit, debouncedSearch],
    () => fetcher("books", currentPage, limit, debouncedSearch)
  );

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setSearch = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleBookDeleted = () => {
    revalidate();
  };

  const handleBookUpdated = () => {
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">إدارة الكتب</h1>
            <p className="text-muted-foreground">
              إضافة وتعديل وحذف الكتب المتاحة
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/books/add">
              <Plus className="w-4 h-4 ml-2" />
              إضافة كتاب جديد
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <BooksSearch searchTerm={searchTerm} onSearchChange={setSearch} />

        {/* Books Table */}
        <Card>
          <CardHeader>
            <CardTitle>الكتب المتاحة ({pagination.total})</CardTitle>
            <CardDescription>جميع الكتب المضافة في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">
                  خطأ في تحميل الكتب:{" "}
                  {(error as any)?.message ?? "حدث خطأ غير معروف"}
                </p>
                {/* Optionally add a retry button */}
                <div className="mt-4">
                  <button
                    onClick={() => revalidate()}
                    className="inline-flex items-center px-3 py-1.5 text-sm rounded-md border"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              </div>
            ) : (
              <>
                <BooksTable
                  books={books}
                  onBookDeleted={handleBookDeleted}
                  onBookUpdated={handleBookUpdated}
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

export default BooksManagement;
