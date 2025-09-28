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

interface VideoCategory {
  id: number;
  name: string;
}

interface VideoCategorySelectProps {
  value?: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const fetcher = async () => {
  const res = await axios.get("/api/categories/videos");
  return res.data;
};

const VideoCategorySelect = ({
  value,
  onChange,
  disabled,
}: VideoCategorySelectProps) => {
  // Fetch categories using SWR
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useSWR("/api/categories/videos", fetcher);

  const categories = categoriesData?.data || [];

  return (
    <Select
      value={value?.toString()}
      onValueChange={(value) => {
        onChange(parseInt(value));
      }}
      disabled={categoriesLoading || disabled}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={
            categoriesLoading ? "جاري تحميل الفئات..." : "اختر فئة الفيديو"
          }
        />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category: VideoCategory) => (
          <SelectItem key={category.id} value={category.id.toString()}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default VideoCategorySelect;
