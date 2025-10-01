"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getMediaUrl } from "@/lib/utils";
import { useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Book } from "@/types";

interface BookModalProps {
  book: Book | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookModal = ({ book, isOpen, onOpenChange }: BookModalProps) => {
  const [loading, setLoading] = useState<boolean>(true);

  const downloadBook = () => {
    if (book) {
      const link = document.createElement("a");
      link.href = getMediaUrl(book.fileUrl);
      link.download = `${book.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setLoading(true);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTitle className="sr-only">
        قراءة الكتاب - {book?.title}
      </DialogTitle>
      <DialogContent
        className="!max-w-[95vw] !w-[95vw] h-[95vh] max-h-[95vh] p-0 bg-white overflow-hidden"
        overlayClassName="bg-black/90"
        showCloseButton={false}
      >
        <div className="relative w-full h-full flex flex-col">
          {/* Header with controls */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center gap-4">
              <h3
                className="font-semibold text-lg truncate max-w-md"
                title={book?.title}
              >
                {book?.title}
              </h3>
              <span className="text-sm text-gray-600">
                {book?.author?.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Download button */}
              <Button
                variant="outline"
                size="sm"
                onClick={downloadBook}
                className="h-8"
              >
                <Download className="h-4 w-4 mr-1" />
                تحميل
              </Button>

              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* PDF Content */}
          <div className="flex-1 relative bg-gray-100">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-600">جاري تحميل الكتاب...</p>
                </div>
              </div>
            )}
            {book && (
              <iframe
                src={getMediaUrl(book.fileUrl)}
                className="w-full h-full border-0"
                title={book.title}
                onLoad={handleIframeLoad}
                onError={() => setLoading(false)}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookModal;
