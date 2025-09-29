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
  Play,
  Clock,
  Calendar,
  User,
  FolderOpen,
  Globe,
  MapPin,
  Eye,
} from "lucide-react";
import { getMediaUrl } from "@/lib/utils";

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

interface ViewVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video | null;
}

export default function ViewVideoDialog({
  open,
  onOpenChange,
  video,
}: ViewVideoDialogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleWatch = () => {
    if (video?.url) {
      window.open(video.url, "_blank");
    }
  };

  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{video.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Poster Image */}
          {video.poster && (
            <div className="flex justify-center">
              <img
                src={getMediaUrl(video.poster)}
                alt={video.title}
                className="max-w-[300px] h-[200px] object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">المتحدثين:</span>
              <span className="font-medium">
                {video.speakers.map((s) => s.name).join(", ")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">الفئة:</span>
              <Badge variant="secondary">{video.category.name}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">اللغة:</span>
              <span>{video.language}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">المدة:</span>
              <span>{formatDuration(video.duration)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">المشاهدات:</span>
              <span>{video.views}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                تاريخ المحاضرة:
              </span>
              <span>{formatDate(video.date)}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">المكان:</span>
              <span>{video.place?.name || "غير محدد"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                تاريخ الإضافة:
              </span>
              <span>{formatDate(video.createdAt)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">الحالة:</span>
            <Badge variant={video.active ? "default" : "outline"}>
              {video.active ? "منشور" : "مسودة"}
            </Badge>
          </div>

          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">العلامات:</span>
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
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
              {video.description}
            </p>
          </div>

          {/* Speakers Bios */}
          {video.speakers.some((s) => s.bio) && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">
                نبذة عن المتحدثين:
              </span>
              <div className="space-y-3">
                {video.speakers
                  .filter((s) => s.bio)
                  .map((speaker) => (
                    <div
                      key={speaker.id}
                      className="bg-muted/30 p-4 rounded-md"
                    >
                      <div className="font-medium text-sm mb-2">
                        {speaker.name}
                      </div>
                      <p className="text-sm leading-relaxed">{speaker.bio}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Place Address */}
          {video.place?.address && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">
                عنوان المكان:
              </span>
              <p className="text-sm leading-relaxed bg-muted/30 p-4 rounded-md">
                {video.place.address}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إغلاق
            </Button>
            <Button onClick={handleWatch} className="gap-2">
              <Play className="h-4 w-4" />
              مشاهدة الفيديو
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
