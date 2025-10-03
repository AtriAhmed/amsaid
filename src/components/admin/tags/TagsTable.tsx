import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { BookOpen, Edit, Tag, Trash2, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import TagDialog from "@/components/admin/tags/TagDialog";

interface Tag {
  id: number;
  name: string;
  _count: {
    books: number;
    videos: number;
  };
}

interface TagsTableProps {
  tags: Tag[];
  onTagDeleted: () => void;
  onTagUpdated?: () => void;
}

export default function TagsTable({
  tags,
  onTagDeleted,
  onTagUpdated,
}: TagsTableProps) {
  const t = useTranslations("common");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    tag: Tag | null;
  }>({
    open: false,
    tag: null,
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    tag: Tag | null;
  }>({
    open: false,
    tag: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (tag: Tag) => {
    setDeleteDialog({
      open: true,
      tag,
    });
  };

  const handleEditClick = (tag: Tag) => {
    setEditDialog({
      open: true,
      tag,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.tag) return;

    try {
      setIsDeleting(true);

      await axios.delete(`/api/tags/${deleteDialog.tag.id}`);

      // Success
      setDeleteDialog({ open: false, tag: null });
      onTagDeleted();
    } catch (error: any) {
      console.error("Error deleting tag:", error);
      // You might want to show a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTagUpdated = () => {
    setEditDialog({ open: false, tag: null });
    onTagUpdated?.();
  };

  const canDelete = (tag: Tag) => {
    return tag?._count.books === 0 && tag?._count.videos === 0;
  };

  if (tags.length === 0) {
    return (
      <div className="text-center py-8">
        <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{t("no tags available")}</p>
      </div>
    );
  }

  return (
    <>
      <Table className="min-w-[400px]">
        <TableHeader>
          <TableRow>
            <TableHead>{t("tag name")}</TableHead>
            <TableHead>{t("content count")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>
                <div className="font-medium">{tag.name}</div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 w-fit"
                  >
                    <BookOpen className="h-3 w-3" />
                    {tag._count.books} {t("book")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 w-fit"
                  >
                    <Video className="h-3 w-3" />
                    {tag._count.videos} {t("video")}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(tag)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(tag)}
                    disabled={!canDelete(tag)}
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
            tag: open ? deleteDialog.tag : null,
          })
        }
        title={t("delete tag")}
        description={`${t("are you sure delete tag")} "${
          deleteDialog.tag?.name
        }"؟`}
        warningTitle={t("warning")}
        warningMessage={
          canDelete(deleteDialog.tag!)
            ? t("tag will be deleted permanently")
            : `${t("cannot delete tag has content")} ${
                (deleteDialog.tag?._count.books || 0) +
                (deleteDialog.tag?._count.videos || 0)
              } ${t("content items")}.`
        }
        confirmText={t("delete")}
        cancelText={t("cancel")}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        variant="destructive"
        disabled={deleteDialog.tag ? !canDelete(deleteDialog.tag) : false}
      />

      {editDialog.open && (
        <TagDialog
          open={editDialog.open}
          onOpenChange={(open: boolean) =>
            setEditDialog({ open, tag: open ? editDialog.tag : null })
          }
          tag={editDialog.tag}
          onTagUpdated={handleTagUpdated}
        />
      )}
    </>
  );
}
