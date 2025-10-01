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
import useSWR, { useSWRConfig } from "swr";

interface Speaker {
  id: number;
  name: string;
  bio?: string;
}

interface SpeakersComboboxProps {
  value: (number | string)[];
  onChange: (value: (number | string)[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

// SWR fetcher function
const fetcher = async (search: string, limit: number) => {
  const res = await axios.get<Speaker[]>("/api/authors", {
    params: {
      search,
      limit,
    },
  });
  return res.data;
};

export default function SpeakersCombobox({
  value = [],
  onChange,
  placeholder = "اختر المتحدثين...",
  disabled = false,
}: SpeakersComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const limit = 20;
  const config = useSWRConfig();

  // Debounce search to avoid excessive API calls
  const [debouncedSearch] = useDebounce(searchValue, 300);

  const {
    data: speakers = [],
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR<Speaker[]>(
    ["authors", debouncedSearch, limit],
    () => fetcher(debouncedSearch, limit),
    {
      fallbackData: config?.fallback?.authors,
    }
  );

  const handleSearch = (search: string) => {
    setSearchValue(search);
  };

  const handleAddSpeaker = () => {
    if (!searchValue.trim()) return;

    const speakerName = searchValue.trim();
    onChange([...value, speakerName]);
    setSearchValue("");
  };

  const handleToggleSpeaker = (speakerId: number) => {
    const isSelected = value.includes(speakerId);
    if (isSelected) {
      onChange(value.filter((id) => id !== speakerId));
    } else {
      onChange([...value, speakerId]);
    }
  };

  const handleRemoveSpeaker = (speakerToRemove: number | string) => {
    onChange(value.filter((speaker) => speaker !== speakerToRemove));
  };

  const selectedSpeakers = value
    .map((val) => {
      if (typeof val === "string") {
        return { id: val, name: val, isNew: true };
      }
      return {
        ...speakers.find((speaker) => speaker.id === val),
        isNew: false,
      };
    })
    .filter(Boolean);

  const canCreateSpeaker =
    searchValue.trim() &&
    !speakers.some(
      (speaker) => speaker.name.toLowerCase() === searchValue.toLowerCase()
    ) &&
    !value.some((val) =>
      typeof val === "string"
        ? val.toLowerCase() === searchValue.toLowerCase()
        : speakers.find((speaker) => speaker.id === val)?.name.toLowerCase() ===
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
            size="sm"
            className="w-full justify-between"
            disabled={disabled}
          >
            {value.length > 0 ? `تم اختيار ${value.length} متحدث` : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="ابحث عن متحدث..."
              value={searchValue}
              onValueChange={handleSearch}
            />
            <CommandList>
              {isLoading ? (
                <CommandEmpty>جاري البحث...</CommandEmpty>
              ) : error ? (
                <CommandEmpty>حدث خطأ في تحميل البيانات</CommandEmpty>
              ) : speakers.length === 0 ? (
                <CommandEmpty>لا توجد نتائج.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {speakers.map((speaker) => {
                    const isSelected = value.includes(speaker.id);
                    return (
                      <CommandItem
                        key={speaker.id}
                        value={speaker.name}
                        onSelect={() => handleToggleSpeaker(speaker.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{speaker.name}</div>
                          {speaker.bio && (
                            <div className="text-sm text-muted-foreground truncate">
                              {speaker.bio}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {canCreateSpeaker && (
                <CommandGroup>
                  <CommandItem onSelect={handleAddSpeaker}>
                    <Plus className="mr-2 h-4 w-4" />
                    {`إضافة "${searchValue}"`}
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected speakers display */}
      {selectedSpeakers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSpeakers.map((speaker, index) => (
            <Badge
              key={`${speaker?.id}-${index}`}
              variant="secondary"
              className="gap-1"
            >
              {speaker?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => speaker?.id && handleRemoveSpeaker(speaker.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
