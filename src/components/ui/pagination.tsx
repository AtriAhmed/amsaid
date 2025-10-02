import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <div
      className={cn("flex items-center justify-center space-x-2", className)}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4 rtl:hidden" />
        <ChevronRight className="h-4 w-4 hidden rtl:block" />
      </Button>

      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === "..." ? (
            <span className="px-2">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4 rtl:hidden" />
        <ChevronLeft className="h-4 w-4 hidden rtl:block" />
      </Button>
    </div>
  );
}
