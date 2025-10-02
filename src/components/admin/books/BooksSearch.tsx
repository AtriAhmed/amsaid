import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useTranslations } from "next-intl";

interface BooksSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
}

export default function BooksSearch({
  searchTerm,
  onSearchChange,
  categoryFilter = "all",
  onCategoryFilterChange,
  statusFilter = "all",
  onStatusFilterChange,
}: BooksSearchProps) {
  const t = useTranslations("common");

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {t("search and filter")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search in books")}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-10"
            />
          </div>

          {onCategoryFilterChange && (
            <Select
              value={categoryFilter}
              onValueChange={onCategoryFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("filter by category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all categories")}</SelectItem>
                {/* These would be dynamically loaded */}
                <SelectItem value="فقه">فقه</SelectItem>
                <SelectItem value="تفسير">تفسير</SelectItem>
                <SelectItem value="عقيدة">عقيدة</SelectItem>
                <SelectItem value="حديث">حديث</SelectItem>
              </SelectContent>
            </Select>
          )}

          {onStatusFilterChange && (
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("filter by status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all statuses")}</SelectItem>
                <SelectItem value="published">{t("published")}</SelectItem>
                <SelectItem value="draft">{t("draft")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
