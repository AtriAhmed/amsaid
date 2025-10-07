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
const fetcher = async (search: string) => {
  const res = await axios.get<Place[]>("/api/places", {
    params: {
      search,
    },
  });
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
  } = useSWR<Place[]>(["places", debouncedSearch], () =>
    fetcher(debouncedSearch)
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
                  {t("error loading places")}
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
