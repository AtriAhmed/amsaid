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
import PlaceDialog from "@/components/admin/places/PlaceDialog";
import PlacesTable from "@/components/admin/places/PlacesTable";
import PlacesSearch from "@/components/admin/places/PlacesSearch";

interface Place {
  id: number;
  name: string;
  address?: string | null;
  _count: {
    videos: number;
  };
}

// axios-based fetcher for SWR
const fetcher = async (url: string) => {
  const res = await axios.get<Place[]>(url);
  return res.data;
};

export default function PlacesPage() {
  const t = useTranslations("common");
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Debounce search to avoid excessive API calls
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  const {
    data: places,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR<Place[]>(
    `/api/places${
      debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : ""
    }`,
    fetcher
  );

  const setSearch = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  const handlePlaceCreated = () => {
    revalidate();
  };

  const handlePlaceDeleted = () => {
    revalidate();
  };

  const handlePlaceUpdated = () => {
    revalidate();
  };

  const placesData = places || [];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex gap-2 justify-between items-center mb-8 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("manage places")}</h1>
            <p className="text-muted-foreground">
              {t("add edit delete places")}
            </p>
          </div>
          <div className="ms-auto">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("add new place")}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <PlacesSearch searchTerm={searchTerm} onSearchChange={setSearch} />

        {/* Places Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t("available places")} ({placesData.length})
            </CardTitle>
            <CardDescription>{t("all places in system")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t("loading")}</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">
                  {t("error loading places")}:{" "}
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
              <PlacesTable
                places={placesData}
                onPlaceDeleted={handlePlaceDeleted}
                onPlaceUpdated={handlePlaceUpdated}
              />
            )}
          </CardContent>
        </Card>

        {/* Create Place Dialog */}
        <PlaceDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onPlaceCreated={handlePlaceCreated}
        />
      </div>
    </div>
  );
}
