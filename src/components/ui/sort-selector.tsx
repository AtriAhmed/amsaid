"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowDownNarrowWide, ArrowDownWideNarrow } from "lucide-react";

export interface SortOption {
  value: string;
  label: string;
}

interface SortSelectorProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortByChange: (sortBy: string) => void;
  onSortOrderChange: (sortOrder: "asc" | "desc") => void;
  options: SortOption[];
  className?: string;
  placeholder?: string;
}

const SortSelector = ({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  options,
  className,
  placeholder = "Sort by",
}: SortSelectorProps) => {
  const toggleSortOrder = () => {
    onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
  };

  const selectedOption = options.find((option) => option.value === sortBy);

  const getSortIcon = () => {
    if (sortOrder === "asc") {
      return <ArrowDownNarrowWide className="h-4 w-4" />;
    } else {
      return <ArrowDownWideNarrow className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("flex", className)}>
      {/* Sort Order Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSortOrder}
        className="rounded-r-none px-3 border-r-0"
        title={`Sort ${sortOrder === "asc" ? "ascending" : "descending"}`}
        disabled={!sortBy || sortBy === "none"}
      >
        {getSortIcon()}
      </Button>

      {/* Sort By Select */}
      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="rounded-l-none border-l-0 min-w-[120px] font-medium">
          {selectedOption?.label || placeholder}
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortSelector;
