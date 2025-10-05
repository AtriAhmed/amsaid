"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

const languages = [
  { code: "en", name: "English", countryCode: "US" },
  { code: "fr", name: "Français", countryCode: "FR" },
  { code: "ar", name: "العربية", countryCode: "SA" },
];

type LocaleSwitcherProps = {
  compact?: boolean;
  buttonClassName?: string;
};

export default function LocaleSwitcher({
  compact = true,
  buttonClassName = "",
}: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");

  const handleLanguageChange = (locale: string) => {
    router.replace(pathname, {
      locale,
      scroll: false,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("bg-white/40", buttonClassName)}
        >
          <Languages className="h-4 w-4" />

          {!compact && t("language")}
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
