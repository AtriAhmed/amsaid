import { useState } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
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
import { Edit, Trash2, BookOpen } from "lucide-react";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import EditCategoryDialog from "./EditCategoryDialog";

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    books: number;
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
  const t = useTranslations("common");
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

      await axios.delete(`/api/categories/books/${deleteDialog.category.id}`);

      // Success
      setDeleteDialog({ open: false, category: null });
      onCategoryDeleted();
    } catch (error: any) {
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
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{t("no categories available")}</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("category name")}</TableHead>
            <TableHead>{t("number of books")}</TableHead>
            <TableHead>{t("creation date")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
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
                  <BookOpen className="h-3 w-3" />
                  {category._count.books} {t("book")}
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
                    disabled={category._count.books > 0}
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
        title={t("delete book category")}
        description={`${t("are you sure delete category")} "${
          deleteDialog.category?.name
        }"؟`}
        warningTitle={t("warning")}
        warningMessage={
          deleteDialog.category?._count.books === 0
            ? t("category will be deleted permanently")
            : `${t("cannot delete category contains books")} ${
                deleteDialog.category?._count.books
              } ${t("book")}.`
        }
        confirmText={t("delete")}
        cancelText={t("cancel")}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        variant="destructive"
        disabled={
          deleteDialog.category ? deleteDialog.category._count.books > 0 : false
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
