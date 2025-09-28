import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

interface Author {
  id: number;
  name: string;
  bio: string | null;
}

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Book {
  id: number;
  title: string;
  description: string;
  author: Author;
  category: Category;
  language: string;
  coverPhoto: string | null;
  fileUrl: string;
  pages: number;
  size: number;
  downloads: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

interface EditBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
  onBookUpdated: () => void;
}

export default function EditBookDialog({
  open,
  onOpenChange,
  book,
  onBookUpdated,
}: EditBookDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: book?.title || "",
    description: book?.description || "",
    language: book?.language || "",
    active: book?.active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    try {
      setIsLoading(true);

      await axios.put(`/api/books/${book.id}`, {
        title: formData.title,
        description: formData.description,
        language: formData.language,
        active: formData.active,
      });

      onBookUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating book:", error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when book changes
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        description: book.description,
        language: book.language,
        active: book.active,
      });
    }
  }, [book]);

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>تعديل الكتاب</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">العنوان</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">اللغة</Label>
            <Input
              id="language"
              value={formData.language}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, language: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>معلومات إضافية</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md">
              <Badge variant="outline">المؤلف: {book.author.name}</Badge>
              <Badge variant="outline">الفئة: {book.category.name}</Badge>
              <Badge variant="outline">الصفحات: {book.pages}</Badge>
              <Badge variant="outline">الحجم: {book.size} كيلوبايت</Badge>
              <Badge variant="outline">التحميلات: {book.downloads}</Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, active: e.target.checked }))
              }
            />
            <Label htmlFor="active">منشور</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
