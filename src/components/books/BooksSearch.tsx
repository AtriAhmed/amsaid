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
import { BookCategory } from "@/types";
import { LANGUAGES } from "@/lib/constants";

interface BooksSearchProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  categoryId?: string;
  onCategoryChange: (categoryId: string) => void;
  language?: string;
  onLanguageChange: (language: string) => void;
  className?: string;
}

// Fetcher function for categories
const categoriesFetcher = async () => {
  const response = await axios.get("/api/categories/books");
  return response.data?.data || [];
};

const BooksSearch = ({
  searchTerm,
  onSearchChange,
  categoryId,
  onCategoryChange,
  language,
  onLanguageChange,
  className,
}: BooksSearchProps) => {
  const t = useTranslations("common");

  // Fetch categories with SWR
  const { data: categories = [], error: categoriesError } = useSWR<
    BookCategory[]
  >("book-categories", categoriesFetcher);

  const handleClearFilters = () => {
    onSearchChange("");
    onCategoryChange("");
    onLanguageChange("");
  };

  const hasActiveFilters = searchTerm || categoryId || language;

  const selectedLanguage = LANGUAGES.find((lang) => lang.value === language);

  const selectedCategory = categories.find(
    (cat) => cat.id.toString() === categoryId
  );

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Search and Filters Row */}
        <div className="flex flex-col sm:flex-row gap-1.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search books by title author or description")}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryId || "none"} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full sm:w-fit">
              {selectedCategory?.name || t("all categories")}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("all categories")}</SelectItem>
              {categories.map((category: BookCategory) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Language Filter */}
          <Select value={language || "none"} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-full sm:w-fit">
              {selectedLanguage?.label || t("all languages")}
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

export default BooksSearch;
