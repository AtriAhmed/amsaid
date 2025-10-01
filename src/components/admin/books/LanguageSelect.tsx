"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { LANGUAGES } from "@/lib/constants";

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  ref?: React.Ref<any>;
}

const LanguageSelect = ({
  value,
  onChange,
  disabled,
  ref,
}: LanguageSelectProps) => {
  const selectedLabel = LANGUAGES.find((lang) => lang.value === value)?.label;

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full" ref={ref}>
        {selectedLabel || "اختر اللغة"}
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelect;
