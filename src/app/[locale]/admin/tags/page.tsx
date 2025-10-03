"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TagDialog from "@/components/admin/tags/TagDialog";
import TagsTable from "@/components/admin/tags/TagsTable";
import TagsSearch from "@/components/admin/tags/TagsSearch";

interface Tag {
  id: number;
  name: string;
  _count: {
    books: number;
    videos: number;
  };
}

// axios-based fetcher for SWR
const fetcher = async (url: string) => {
  const res = await axios.get<Tag[]>(url);
  return res.data;
};

export default function TagsPage() {
  const t = useTranslations("common");
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Debounce search to avoid excessive API calls
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  const {
    data: tags,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR<Tag[]>(
    `/api/tags${
      debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : ""
    }`,
    fetcher
  );

  const setSearch = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  const handleTagCreated = () => {
    revalidate();
  };

  const handleTagDeleted = () => {
    revalidate();
  };

  const handleTagUpdated = () => {
    revalidate();
  };

  const tagsData = tags || [];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex gap-2 justify-between items-center mb-8 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("manage tags")}</h1>
            <p className="text-muted-foreground">{t("add edit delete tags")}</p>
          </div>
          <div className="ms-auto">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("add new tag")}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <TagsSearch searchTerm={searchTerm} onSearchChange={setSearch} />

        {/* Tags Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("available tags")} ({tagsData.length})
            </CardTitle>
            <CardDescription>{t("all tags in system")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t("loading")}</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">
                  {t("error loading tags")}:{" "}
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
              <TagsTable
                tags={tagsData}
                onTagDeleted={handleTagDeleted}
                onTagUpdated={handleTagUpdated}
              />
            )}
          </CardContent>
        </Card>

        {/* Create Tag Dialog */}
        <TagDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onTagCreated={handleTagCreated}
        />
      </div>
    </div>
  );
}
