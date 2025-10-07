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
const fetcher = async (search: string) => {
  const res = await axios.get<Tag[]>("/api/tags", {
    params: {
      search,
    },
  });
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
  } = useSWR<Tag[]>(["tags", debouncedSearch], () => fetcher(debouncedSearch));

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
                  {t("error loading tags")}
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
