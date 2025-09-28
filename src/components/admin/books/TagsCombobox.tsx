"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useDebounce } from "use-debounce";
import useSWR from "swr";

interface Tag {
  id: number;
  name: string;
}

interface TagsComboboxProps {
  value: (number | string)[];
  onChange: (value: (number | string)[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

// SWR fetcher function
const fetcher = async (_key: string, search: string, limit: number) => {
  const res = await axios.get<Tag[]>("/api/tags", {
    params: {
      search,
      limit,
    },
  });
  return res.data;
};

export default function TagsCombobox({
  value = [],
  onChange,
  placeholder = "اختر الكلمات المفتاحية...",
  disabled = false,
}: TagsComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const limit = 20;

  // Debounce search to avoid excessive API calls
  const [debouncedSearch] = useDebounce(searchValue, 300);

  const {
    data: tags = [],
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR<Tag[]>(["tags", debouncedSearch, limit], () =>
    fetcher("tags", debouncedSearch, limit)
  );

  const handleSearch = (search: string) => {
    setSearchValue(search);
  };

  const handleAddTag = () => {
    if (!searchValue.trim()) return;

    const tagName = searchValue.trim();
    onChange([...value, tagName]);
    setSearchValue("");
  };

  const handleToggleTag = (tagId: number) => {
    const isSelected = value.includes(tagId);
    if (isSelected) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  const handleRemoveTag = (tagToRemove: number | string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const selectedTags = value
    .map((val) => {
      if (typeof val === "string") {
        return { id: val, name: val, isNew: true };
      }
      return { ...tags.find((tag) => tag.id === val), isNew: false };
    })
    .filter(Boolean);

  const canCreateTag =
    searchValue.trim() &&
    !tags.some((tag) => tag.name.toLowerCase() === searchValue.toLowerCase()) &&
    !value.some((val) =>
      typeof val === "string"
        ? val.toLowerCase() === searchValue.toLowerCase()
        : tags.find((tag) => tag.id === val)?.name.toLowerCase() ===
          searchValue.toLowerCase()
    );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {value.length > 0 ? `تم اختيار ${value.length} عنصر` : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="ابحث عن كلمة مفتاحية..."
              value={searchValue}
              onValueChange={handleSearch}
            />
            <CommandList>
              {isLoading ? (
                <CommandEmpty>جاري البحث...</CommandEmpty>
              ) : error ? (
                <CommandEmpty>حدث خطأ في تحميل البيانات</CommandEmpty>
              ) : tags.length === 0 ? (
                <CommandEmpty>لا توجد نتائج.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {tags.map((tag) => {
                    const isSelected = value.includes(tag.id);
                    return (
                      <CommandItem
                        key={tag.id}
                        value={tag.name}
                        onSelect={() => handleToggleTag(tag.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {tag.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {canCreateTag && (
                <CommandGroup>
                  <CommandItem onSelect={handleAddTag}>
                    <Plus className="mr-2 h-4 w-4" />
                    {`إضافة "${searchValue}"`}
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag, index) => (
            <Badge
              key={`${tag?.id}-${index}`}
              variant="secondary"
              className="gap-1"
            >
              {tag?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => tag?.id && handleRemoveTag(tag.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
