"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Languages } from "lucide-react";
import Image from "next/image";

const languages = [
  { code: "en", name: "English", countryCode: "US" },
  { code: "fr", name: "Français", countryCode: "FR" },
  { code: "ar", name: "العربية", countryCode: "SA" },
];

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (locale: string) => {
    router.replace(pathname, {
      locale,
      scroll: false,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-white/40">
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="cursor-pointer"
          >
            <Image
              src={`https://flagsapi.com/${language.countryCode}/flat/24.png`}
              alt={`${language.name} flag`}
              className="object-cover rounded-sm mr-2"
              width={16}
              height={12}
            />
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
