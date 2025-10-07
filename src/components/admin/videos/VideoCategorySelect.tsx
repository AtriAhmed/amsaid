"use client";

import axios from "axios";
import useSWR, { useSWRConfig } from "swr";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoCategory } from "@/types";

interface VideoCategorySelectProps {
  value?: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  ref?: React.Ref<any>;
}

const fetcher = async () => {
  const res = await axios.get("/api/categories/videos");
  return res.data;
};

export default function VideoCategorySelect({
  value,
  onChange,
  disabled,
  ref,
}: VideoCategorySelectProps) {
  const t = useTranslations("common");
  const config = useSWRConfig();

  // Fetch categories using SWR
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useSWR("/api/categories/videos", fetcher, {
    fallbackData: config?.fallback?.videoCategories,
  });

  const categories = categoriesData?.data || [];

  const selectedLabel = value
    ? categories.find((cat: VideoCategory) => cat.id === value)?.name
    : t("choose category");

  return (
    <Select
      value={value?.toString()}
      onValueChange={(value) => {
        onChange(parseInt(value));
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-full" ref={ref}>
        {selectedLabel}
      </SelectTrigger>
      <SelectContent>
        {categoriesLoading ? (
          <SelectItem value="none" disabled>
            {t("loading")}...
          </SelectItem>
        ) : categories.length > 0 ? (
          categories.map((category: VideoCategory) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              {category.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="none" disabled>
            {t("no categories available")}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
