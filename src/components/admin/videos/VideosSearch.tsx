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

interface VideosSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
}

export default function VideosSearch({
  searchTerm,
  onSearchChange,
  categoryFilter = "all",
  onCategoryFilterChange,
  statusFilter = "all",
  onStatusFilterChange,
}: VideosSearchProps) {
  const t = useTranslations("common");

  return (
    <Card className="mb-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {t("search and filter")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1.5 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search in videos")}
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
                <SelectItem value="خطب">خطب</SelectItem>
                <SelectItem value="دروس">دروس</SelectItem>
                <SelectItem value="شروحات">شروحات</SelectItem>
                <SelectItem value="محاضرات">محاضرات</SelectItem>
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
