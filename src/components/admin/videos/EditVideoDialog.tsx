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

interface Speaker {
  id: number;
  name: string;
  bio: string | null;
}

interface Category {
  id: number;
  name: string;
}

interface Place {
  id: number;
  name: string;
  address: string | null;
}

interface Tag {
  id: number;
  name: string;
}

interface Video {
  id: number;
  title: string;
  description: string;
  speakers: Speaker[];
  category: Category;
  place: Place | null;
  language: string;
  poster: string | null;
  url: string;
  duration: number;
  views: number;
  active: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

interface EditVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video | null;
  onVideoUpdated: () => void;
}

export default function EditVideoDialog({
  open,
  onOpenChange,
  video,
  onVideoUpdated,
}: EditVideoDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    language: "",
    active: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title,
        description: video.description,
        language: video.language,
        active: video.active,
      });
    }
  }, [video]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video) return;

    try {
      setIsLoading(true);

      await axios.put(`/api/videos/${video.id}`, {
        ...formData,
      });

      onVideoUpdated();
    } catch (error: any) {
      console.error("Error updating video:", error);
      // Handle error - you might want to show a toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل الفيديو</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">العنوان *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">اللغة *</Label>
            <Input
              id="language"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              required
              maxLength={50}
            />
          </div>

          {/* Current Info Display */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-md">
            <h3 className="font-medium">المعلومات الحالية:</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">المتحدثين:</span>
                <span className="font-medium mr-2">
                  {video.speakers.map((s) => s.name).join(", ")}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground">الفئة:</span>
                <Badge variant="secondary" className="mr-2">
                  {video.category.name}
                </Badge>
              </div>

              <div>
                <span className="text-muted-foreground">المكان:</span>
                <span className="font-medium mr-2">
                  {video.place?.name || "غير محدد"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground">التاريخ:</span>
                <span className="font-medium mr-2">
                  {new Date(video.date).toLocaleDateString("ar")}
                </span>
              </div>
            </div>

            {video.tags.length > 0 && (
              <div>
                <span className="text-muted-foreground text-sm">العلامات:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {video.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
              className="rounded"
            />
            <Label htmlFor="active">منشور</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
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
