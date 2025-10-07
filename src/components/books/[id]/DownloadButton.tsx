"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getBookMediaUrl } from "@/lib/utils";

interface DownloadButtonProps {
  bookId: number;
  bookTitle: string;
  className?: string;
  size?: "sm" | "lg" | "default";
  children?: React.ReactNode;
}

export default function DownloadButton({
  bookId,
  bookTitle,
  className,
  size = "default",
  children,
}: DownloadButtonProps) {
  const downloadBook = () => {
    const link = document.createElement("a");
    link.href = getBookMediaUrl(bookId);
    link.download = `${bookTitle}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={downloadBook} className={className} size={size}>
      {children || (
        <>
          <Download className="h-4 w-4" />
        </>
      )}
    </Button>
  );
}
