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

interface Speaker {
  id: number;
  name: string;
  bio?: string;
}

interface SpeakerComboboxProps {
  value: number | string | null;
  onChange: (value: number | string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

// SWR fetcher function
const fetcher = async (_key: string, search: string, limit: number) => {
  const res = await axios.get<Speaker[]>("/api/authors", {
    params: {
      search,
      limit,
    },
  });
  return res.data;
};

export default function SpeakerCombobox({
  value,
  onChange,
  placeholder = "اختر متحدث...",
  disabled = false,
}: SpeakerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const limit = 20;

  // Debounce search to avoid excessive API calls
  const [debouncedSearch] = useDebounce(searchValue, 300);

  const {
    data: speakers = [],
    error,
    isLoading,
  } = useSWR<Speaker[]>(["authors", debouncedSearch, limit], () =>
    fetcher("authors", debouncedSearch, limit)
  );

  const handleSearch = (search: string) => {
    setSearchValue(search);
  };

  const handleSetSpeakerAsText = () => {
    if (!searchValue.trim()) return;

    onChange(searchValue.trim());
    setSearchValue("");
    setOpen(false);
  };

  const selectedSpeaker =
    typeof value === "number"
      ? speakers.find((speaker) => speaker.id === value)
      : null;

  // Show the option to create a new speaker if:
  // 1. We have a search value
  // 2. No exact match exists in the speakers list
  // 3. It's not just whitespace
  const canCreateSpeaker =
    searchValue.trim().length > 0 &&
    !speakers.some(
      (speaker) => speaker.name.toLowerCase() === searchValue.toLowerCase()
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
          {selectedSpeaker?.name ||
            (typeof value === "string" && value ? value : placeholder)}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="البحث عن متحدث..."
            value={searchValue}
            onValueChange={handleSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "جاري البحث..." : "لم يتم العثور على متحدث."}
            </CommandEmpty>

            {speakers.length > 0 && (
              <CommandGroup>
                {speakers.map((speaker) => (
                  <CommandItem
                    key={speaker.id}
                    value={speaker.name}
                    onSelect={() => {
                      onChange(speaker.id);
                      setSearchValue("");
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === speaker.id ? "opacity-100" : "opacity-0"
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
                ))}
              </CommandGroup>
            )}

            {canCreateSpeaker && (
              <CommandGroup>
                <CommandItem onSelect={handleSetSpeakerAsText}>
                  <Plus className="mr-2 h-4 w-4" />
                  إضافة "{searchValue}" كمتحدث جديد
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
