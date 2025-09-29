"use client";

import axios from "axios";
import useSWR from "swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookCategory {
  id: number;
  name: string;
}

interface CategorySelectProps {
  value?: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const fetcher = async () => {
  const res = await axios.get("/api/categories/books");
  return res.data;
};

const CategorySelect = ({ value, onChange, disabled }: CategorySelectProps) => {
  // axios-based fetcher for SWR

  // Fetch categories using SWR
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useSWR("/api/categories/books", fetcher);

  const categories = categoriesData?.data || [];

  return (
    <Select
      value={value?.toString()}
      onValueChange={(value) => {
        onChange(parseInt(value));
      }}
      disabled={categoriesLoading || disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={
            categoriesLoading
              ? "جاري تحميل الفئات..."
              : categoriesError
              ? "خطأ في تحميل الفئات"
              : "اختر الفئة"
          }
        />
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
};

export default CategorySelect;
