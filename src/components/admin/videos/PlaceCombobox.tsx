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
import useSWR, { useSWRConfig } from "swr";

interface Place {
  id: number;
  name: string;
  address?: string;
}

interface PlaceComboboxProps {
  value: number | string | null;
  onChange: (value: number | string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  ref?: React.Ref<any>;
}

// SWR fetcher function
const fetcher = async (search: string, limit: number) => {
  const res = await axios.get<Place[]>("/api/places", {
    params: {
      search,
      limit,
    },
  });
  return res.data;
};

export default function PlaceCombobox({
  value,
  onChange,
  placeholder = "اختر مكان...",
  disabled = false,
  ref,
}: PlaceComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const limit = 20;
  const config = useSWRConfig();

  // Debounce search to avoid excessive API calls
  const [debouncedSearch] = useDebounce(searchValue, 300);

  const {
    data: places = [],
    error,
    isLoading,
  } = useSWR<Place[]>(
    ["places", debouncedSearch, limit],
    () => fetcher(debouncedSearch, limit),
    {
      fallbackData: config?.fallback?.places,
    }
  );

  const handleSearch = (search: string) => {
    setSearchValue(search);
  };

  const handleSetPlaceAsText = () => {
    if (!searchValue.trim()) return;

    onChange(searchValue.trim());
    setSearchValue("");
    setOpen(false);
  };

  const selectedPlace =
    typeof value === "number"
      ? places.find((place) => place.id === value)
      : null;

  // Show the option to create a new place if:
  // 1. We have a search value
  // 2. No exact match exists in the places list
  // 3. It's not just whitespace
  const canCreatePlace =
    searchValue.trim().length > 0 &&
    !places.some(
      (place) => place.name.toLowerCase() === searchValue.toLowerCase()
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className="w-full justify-between"
          disabled={disabled}
          ref={ref}
        >
          {selectedPlace?.name ||
            (typeof value === "string" && value ? value : placeholder)}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="البحث عن مكان..."
            value={searchValue}
            onValueChange={handleSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "جاري البحث..." : "لم يتم العثور على مكان."}
            </CommandEmpty>

            {places.length > 0 && (
              <CommandGroup>
                {places.map((place) => (
                  <CommandItem
                    key={place.id}
                    value={place.name}
                    onSelect={() => {
                      onChange(place.id);
                      setSearchValue("");
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === place.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{place.name}</div>
                      {place.address && (
                        <div className="text-sm text-muted-foreground truncate">
                          {place.address}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {canCreatePlace && (
              <CommandGroup>
                <CommandItem onSelect={handleSetPlaceAsText}>
                  <Plus className="mr-2 h-4 w-4" />
                  إضافة "{searchValue}" كمكان جديد
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
