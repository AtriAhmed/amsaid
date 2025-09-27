import { useState } from "react";
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
import { Edit, Trash2, Video } from "lucide-react";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import EditCategoryDialog from "./EditCategoryDialog";

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    videos: number;
  };
}

interface CategoriesTableProps {
  categories: Category[];
  onCategoryDeleted: () => void;
  onCategoryUpdated?: () => void;
}

export default function CategoriesTable({
  categories,
  onCategoryDeleted,
  onCategoryUpdated,
}: CategoriesTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    category: Category | null;
  }>({
    open: false,
    category: null,
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    category: Category | null;
  }>({
    open: false,
    category: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (category: Category) => {
    setDeleteDialog({
      open: true,
      category,
    });
  };

  const handleEditClick = (category: Category) => {
    setEditDialog({
      open: true,
      category,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.category) return;

    try {
      setIsDeleting(true);

      const response = await fetch(
        `/api/categories/videos/${deleteDialog.category.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في حذف الفئة");
      }

      // Success
      setDeleteDialog({ open: false, category: null });
      onCategoryDeleted();
    } catch (error) {
      console.error("Error deleting category:", error);
      // You might want to show a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCategoryUpdated = () => {
    setEditDialog({ open: false, category: null });
    onCategoryUpdated?.();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UK", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">لا توجد فئات متاحة</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم الفئة</TableHead>
            <TableHead>عدد الفيديوهات</TableHead>
            <TableHead>تاريخ الإنشاء</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <div className="font-medium">{category.name}</div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 w-fit"
                >
                  <Video className="h-3 w-3" />
                  {category._count.videos} فيديو
                </Badge>
              </TableCell>
              <TableCell>{formatDate(category.createdAt)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(category)}
                    disabled={category._count.videos > 0}
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
            category: open ? deleteDialog.category : null,
          })
        }
        title="حذف فئة الفيديوهات"
        description={`هل أنت متأكد من حذف فئة "${deleteDialog.category?.name}"؟`}
        warningTitle="تحذير"
        warningMessage={
          deleteDialog.category?._count.videos === 0
            ? "سيتم حذف هذه الفئة نهائياً."
            : `لا يمكن حذف هذه الفئة لأنها تحتوي على ${deleteDialog.category?._count.videos} فيديو.`
        }
        confirmText="حذف"
        cancelText="إلغاء"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        variant="destructive"
        disabled={
          deleteDialog.category
            ? deleteDialog.category._count.videos > 0
            : false
        }
      />

      <EditCategoryDialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog({ open, category: open ? editDialog.category : null })
        }
        category={editDialog.category}
        onCategoryUpdated={handleCategoryUpdated}
      />
    </>
  );
}
