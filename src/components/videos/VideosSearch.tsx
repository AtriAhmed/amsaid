"use client";

import { useTranslations } from "next-intl";
import useSWR from "swr";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { VideoCategory } from "@/types";
import { LANGUAGES } from "@/lib/constants";
import SortSelector, { SortOption } from "@/components/ui/sort-selector";

interface VideosSearchProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  categoryId?: string;
  onCategoryChange: (categoryId: string) => void;
  language?: string;
  onLanguageChange: (language: string) => void;
  sortBy?: string;
  onSortByChange: (sortBy: string) => void;
  sortOrder?: "asc" | "desc";
  onSortOrderChange: (sortOrder: "asc" | "desc") => void;
  className?: string;
}

// Fetcher function for categories
const categoriesFetcher = async () => {
  const response = await axios.get("/api/categories/videos");
  return response.data?.data || [];
};

// Sort options for videos (will be translated in component)
const SORT_OPTIONS_KEYS = [
  { value: "title", labelKey: "title" },
  { value: "createdAt", labelKey: "date" },
  { value: "duration", labelKey: "duration" },
];

const VideosSearch = ({
  searchTerm,
  onSearchChange,
  categoryId,
  onCategoryChange,
  language,
  onLanguageChange,
  sortBy = "createdAt",
  onSortByChange,
  sortOrder = "desc",
  onSortOrderChange,
  className,
}: VideosSearchProps) => {
  const t = useTranslations("common");

  // Fetch categories with SWR
  const { data: categories = [], error: categoriesError } = useSWR<
    VideoCategory[]
  >("video-categories", categoriesFetcher);

  const handleClearFilters = () => {
    onSearchChange("");
    onCategoryChange("");
    onLanguageChange("");
    onSortByChange("createdAt");
    onSortOrderChange("desc");
  };

  const hasActiveFilters =
    searchTerm ||
    categoryId ||
    language ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  const selectedLanguage = LANGUAGES.find((lang) => lang.value === language);

  const selectedCategory = categories.find(
    (cat) => cat.id.toString() === categoryId
  );

  // Create translated sort options
  const sortOptions: SortOption[] = SORT_OPTIONS_KEYS.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Search and Filters Row */}
        <div className="flex gap-1.5 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search videos by title speaker or description")}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryId || "none"} onValueChange={onCategoryChange}>
            <SelectTrigger className="grow sm:grow-0">
              {selectedCategory?.name
                ? t(selectedCategory?.name)
                : t("all categories")}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("all categories")}</SelectItem>
              {categories.map((category: VideoCategory) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Language Filter */}
          <Select value={language || "none"} onValueChange={onLanguageChange}>
            <SelectTrigger className="grow sm:grow-0">
              {selectedLanguage?.label
                ? t(selectedLanguage?.label)
                : t("all languages")}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("all languages")}</SelectItem>
              {LANGUAGES?.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {t(lang.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Selector */}
          <SortSelector
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={onSortByChange}
            onSortOrderChange={onSortOrderChange}
            options={sortOptions}
            placeholder={t("sort by")}
          />

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="flex items-center gap-2 min-w-fit"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideosSearch;
