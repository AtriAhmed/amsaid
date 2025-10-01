import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  BookOpen,
  Calendar,
  User,
  FolderOpen,
  Globe,
} from "lucide-react";
import { getMediaUrl } from "@/lib/utils";
import { Book } from "@/types";

interface ViewBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
}

export default function ViewBookDialog({
  open,
  onOpenChange,
  book,
}: ViewBookDialogProps) {
  const formatDate = (date?: Date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("ar", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownload = () => {
    if (book?.fileUrl) {
      window.open(book.fileUrl, "_blank");
    }
  };

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{book.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cover Photo */}
          {book.coverPhoto && (
            <div className="flex justify-center">
              <img
                src={getMediaUrl(book.coverPhoto)}
                alt={book.title}
                className="max-w-[200px] h-[200px] object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">المؤلف:</span>
              <span className="font-medium">{book.author?.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">الفئة:</span>
              <Badge variant="secondary">{book.category?.name}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">اللغة:</span>
              <span>{book.language}</span>
            </div>

            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">الصفحات:</span>
              <span>{book.pages} صفحة</span>
            </div>

            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">التحميلات:</span>
              <span>{book.downloads}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                تاريخ الإضافة:
              </span>
              <span>{formatDate(book.createdAt)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">الحالة:</span>
            <Badge variant={book.active ? "default" : "outline"}>
              {book.active ? "منشور" : "مسودة"}
            </Badge>
          </div>

          {/* Tags */}
          {book.tags?.length! > 0 && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">العلامات:</span>
              <div className="flex flex-wrap gap-2">
                {book.tags?.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">الوصف:</span>
            <p className="text-sm leading-relaxed bg-muted/30 p-4 rounded-md">
              {book.description}
            </p>
          </div>

          {/* Author Bio */}
          {book.author?.bio && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">
                نبذة عن المؤلف:
              </span>
              <p className="text-sm leading-relaxed bg-muted/30 p-4 rounded-md">
                {book.author.bio}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إغلاق
            </Button>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              تحميل الكتاب
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
