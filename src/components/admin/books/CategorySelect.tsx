"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { BookCategory } from "@/types";
import axios from "axios";
import useSWR, { useSWRConfig } from "swr";
import { useTranslations } from "next-intl";

interface CategorySelectProps {
  value?: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  ref?: React.Ref<any>;
}

const fetcher = async () => {
  const res = await axios.get("/api/categories/books");
  return res.data;
};

export default function CategorySelect({
  value,
  onChange,
  disabled,
  ref,
}: CategorySelectProps) {
  const t = useTranslations("common");
  const config = useSWRConfig();

  // Fetch categories using SWR
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useSWR("/api/categories/books", fetcher, {
    fallbackData: config?.fallback?.bookCategories, // Default category
  });

  const categories = categoriesData?.data || [];

  const selectedLabel = value
    ? categories.find((cat: BookCategory) => cat.id === value)?.name
    : t("choose category");

  return (
    <Select
      value={value?.toString()}
      onValueChange={(value) => {
        onChange(parseInt(value));
      }}
      disabled={disabled}
    >
      <SelectTrigger ref={ref} className="w-full">
        {selectedLabel}
      </SelectTrigger>
      <SelectContent>
        {categories.map((category: BookCategory) => (
          <SelectItem key={category.id} value={category.id.toString()}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
