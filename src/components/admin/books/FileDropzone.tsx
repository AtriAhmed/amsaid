"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, getMediaUrl } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface FileDropzoneProps {
  onDrop: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxSize?: number;
  value?: File | string | null;
  onRemove?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function FileDropzone({
  onDrop,
  accept,
  multiple = false,
  maxSize,
  value,
  onRemove,
  placeholder,
  className,
  disabled = false,
}: FileDropzoneProps) {
  const t = useTranslations("common");
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const defaultPlaceholder =
    placeholder || t("drag and drop file here or click to select");

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop: onDropCallback,
      accept,
      multiple,
      maxSize,
      disabled,
    });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (value: File | string) => {
    if (typeof value === "string") {
      // Handle string URL
      if (value.toLowerCase().endsWith(".pdf")) {
        return <FileText className="h-8 w-8 text-red-500" />;
      }
      if (value.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return (
          <img
            src={getMediaUrl(value)}
            alt="Preview"
            className="h-8 w-8 object-cover rounded"
          />
        );
      }
      return <FileText className="h-8 w-8 text-gray-500" />;
    } else {
      // Handle File object
      if (value.type === "application/pdf") {
        return <FileText className="h-8 w-8 text-red-500" />;
      }
      if (value.type.startsWith("image/")) {
        return (
          <img
            src={URL.createObjectURL(value)}
            alt="Preview"
            className="h-8 w-8 object-cover rounded"
          />
        );
      }
      return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  if (value) {
    return (
      <div className={cn("border-2 border-dashed rounded-lg p-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getFileIcon(value)}
            <div>
              <p className="text-sm font-medium">
                {typeof value === "string"
                  ? value.split("/").pop() || "File"
                  : value.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {typeof value === "string" ? null : formatFileSize(value.size)}
              </p>
            </div>
          </div>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragActive && "border-primary bg-primary/5",
        isDragReject && "border-destructive bg-destructive/5",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-sm text-muted-foreground mb-2">
        {isDragActive
          ? t("drop file here")
          : isDragReject
          ? t("unsupported file type")
          : defaultPlaceholder}
      </p>
      <Button type="button" variant="outline" size="sm" disabled={disabled}>
        {t("choose file")}
      </Button>
      {maxSize && (
        <p className="text-xs text-muted-foreground mt-2">
          {t("max size")}: {formatFileSize(maxSize)}
        </p>
      )}
    </div>
  );
}
