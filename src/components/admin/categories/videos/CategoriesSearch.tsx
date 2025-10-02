import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface CategoriesSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function CategoriesSearch({
  searchTerm,
  onSearchChange,
}: CategoriesSearchProps) {
  const t = useTranslations("common");

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t("search and filter")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search in video categories")}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
