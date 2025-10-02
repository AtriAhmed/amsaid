import { useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Play, Clock } from "lucide-react";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import EditVideoDialog from "@/components/admin/videos/EditVideoDialog";
import ViewVideoDialog from "@/components/admin/videos/ViewVideoDialog";
import Link from "next/link";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils";
import { formatDuration } from "@/lib/date";
import { useTranslations } from "next-intl";
import { Video } from "@/types";

interface VideosTableProps {
  videos: Video[];
  onVideoDeleted: () => void;
  onVideoUpdated?: () => void;
}

export default function VideosTable({
  videos,
  onVideoDeleted,
  onVideoUpdated,
}: VideosTableProps) {
  const t = useTranslations("common");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    video: Video | null;
  }>({
    open: false,
    video: null,
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    video: Video | null;
  }>({
    open: false,
    video: null,
  });
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    video: Video | null;
  }>({
    open: false,
    video: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (video: Video) => {
    setDeleteDialog({
      open: true,
      video,
    });
  };

  const handleViewClick = (video: Video) => {
    setViewDialog({
      open: true,
      video,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.video) return;

    try {
      setIsDeleting(true);

      await axios.delete(`/api/videos/${deleteDialog.video.id}`);

      // Success
      setDeleteDialog({ open: false, video: null });
      onVideoDeleted();
    } catch (error: any) {
      console.error("Error deleting video:", error);
      // You might want to show a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVideoUpdated = () => {
    setEditDialog({ open: false, video: null });
    onVideoUpdated?.();
  };

  const formatDate = (date?: Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-UK", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{t("no videos available")}</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("video")}</TableHead>
            <TableHead>{t("category")}</TableHead>
            <TableHead>{t("duration")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("views")}</TableHead>
            <TableHead>{t("date added")}</TableHead>
            <TableHead className="text-end">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video) => (
            <TableRow key={video.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-12 bg-muted rounded flex items-center justify-center overflow-hidden border">
                    {video?.poster ? (
                      <Image
                        src={getMediaUrl(video.poster)}
                        fill
                        alt={`${video.title} poster`}
                        className="object-cover"
                      />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{video.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {video.speakers
                        ?.slice(0, 1)
                        .map((speaker) => speaker.name)
                        .join(", ")}
                      {video.speakers?.length! > 1
                        ? ` +${video.speakers?.length! - 1}`
                        : ""}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{video.category?.name}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(video.duration)}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={video.active ? "default" : "outline"}>
                  {video.active ? t("published") : t("draft")}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {video.views}
                </div>
              </TableCell>
              <TableCell>{formatDate(video.createdAt)}</TableCell>
              <TableCell>
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewClick(video)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/videos/${video.id}`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(video)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({
            open,
            video: open ? deleteDialog.video : null,
          })
        }
        title={t("delete video")}
        description={`${t("are you sure delete video")} "${
          deleteDialog.video?.title
        }"?`}
        warningTitle={t("warning")}
        warningMessage={t("video will be deleted permanently")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        variant="destructive"
      />

      <ViewVideoDialog
        open={viewDialog.open}
        onOpenChange={(open: boolean) =>
          setViewDialog({ open, video: open ? viewDialog.video : null })
        }
        video={viewDialog.video}
      />

      <EditVideoDialog
        open={editDialog.open}
        onOpenChange={(open: boolean) =>
          setEditDialog({ open, video: open ? editDialog.video : null })
        }
        video={editDialog.video}
        onVideoUpdated={handleVideoUpdated}
      />
    </>
  );
}
