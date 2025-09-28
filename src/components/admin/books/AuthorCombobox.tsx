"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
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
import { cn } from "@/lib/utils";
import axios from "axios";
import { useDebounce } from "use-debounce";
import useSWR from "swr";

interface Author {
  id: number;
  name: string;
  bio?: string;
}

interface AuthorComboboxProps {
  value: number | string | null;
  onChange: (value: number | string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

// SWR fetcher function
const fetcher = async (_key: string, search: string, limit: number) => {
  const res = await axios.get<Author[]>("/api/authors", {
    params: {
      search,
      limit,
    },
  });
  return res.data;
};

export default function AuthorCombobox({
  value,
  onChange,
  placeholder = "اختر مؤلف...",
  disabled = false,
}: AuthorComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const limit = 20;

  // Debounce search to avoid excessive API calls
  const [debouncedSearch] = useDebounce(searchValue, 300);

  const {
    data: authors = [],
    error,
    isLoading,
  } = useSWR<Author[]>(["authors", debouncedSearch, limit], () =>
    fetcher("authors", debouncedSearch, limit)
  );

  const handleSearch = (search: string) => {
    setSearchValue(search);
  };

  const handleSetAuthorAsText = () => {
    if (!searchValue.trim()) return;

    onChange(searchValue.trim());
    setSearchValue("");
    setOpen(false);
  };

  const selectedAuthor =
    typeof value === "number"
      ? authors.find((author) => author.id === value)
      : null;

  const displayValue = typeof value === "string" ? value : selectedAuthor?.name;

  const canCreateAuthor =
    searchValue.trim() &&
    !authors.some(
      (author) => author.name.toLowerCase() === searchValue.toLowerCase()
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {displayValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="ابحث عن مؤلف..."
            value={searchValue}
            onValueChange={handleSearch}
          />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>جاري البحث...</CommandEmpty>
            ) : error ? (
              <CommandEmpty>حدث خطأ في تحميل البيانات</CommandEmpty>
            ) : authors.length === 0 ? (
              <CommandEmpty>لا توجد نتائج.</CommandEmpty>
            ) : (
              <CommandGroup>
                {authors.map((author) => (
                  <CommandItem
                    key={author.id}
                    value={author.name}
                    onSelect={() => {
                      onChange(author.id);
                      setSearchValue("");
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === author.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{author.name}</div>
                      {author.bio && (
                        <div className="text-sm text-muted-foreground truncate">
                          {author.bio}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {canCreateAuthor && (
              <CommandGroup>
                <CommandItem onSelect={handleSetAuthorAsText}>
                  <Plus className="mr-2 h-4 w-4" />
                  `استخدام "${searchValue}"`
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
