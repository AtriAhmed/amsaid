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

interface CategorySelectProps {
  value?: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const fetcher = async () => {
  const res = await axios.get("/api/categories/books");
  return res.data;
};

export default function CategorySelect({
  value,
  onChange,
  disabled,
}: CategorySelectProps) {
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
    : "اختر الفئة";

  return (
    <Select
      value={value?.toString()}
      onValueChange={(value) => {
        onChange(parseInt(value));
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">{selectedLabel}</SelectTrigger>
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
