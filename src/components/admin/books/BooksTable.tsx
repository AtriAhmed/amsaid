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
import { Edit, Trash2, Download, Eye, BookOpen } from "lucide-react";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import EditBookDialog from "./EditBookDialog";
import ViewBookDialog from "./ViewBookDialog";
import Link from "next/link";

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

interface BooksTableProps {
  books: Book[];
  onBookDeleted: () => void;
  onBookUpdated?: () => void;
}

export default function BooksTable({
  books,
  onBookDeleted,
  onBookUpdated,
}: BooksTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    book: Book | null;
  }>({
    open: false,
    book: null,
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    book: Book | null;
  }>({
    open: false,
    book: null,
  });
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    book: Book | null;
  }>({
    open: false,
    book: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (book: Book) => {
    setDeleteDialog({
      open: true,
      book,
    });
  };

  const handleEditClick = (book: Book) => {
    setEditDialog({
      open: true,
      book,
    });
  };

  const handleViewClick = (book: Book) => {
    setViewDialog({
      open: true,
      book,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.book) return;

    try {
      setIsDeleting(true);

      await axios.delete(`/api/books/${deleteDialog.book.id}`);

      // Success
      setDeleteDialog({ open: false, book: null });
      onBookDeleted();
    } catch (error: any) {
      console.error("Error deleting book:", error);
      // You might want to show a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBookUpdated = () => {
    setEditDialog({ open: false, book: null });
    onBookUpdated?.();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UK", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (books.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">لا توجد كتب متاحة</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>العنوان</TableHead>
            <TableHead>الفئة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>التحميلات</TableHead>
            <TableHead>تاريخ الإضافة</TableHead>
            <TableHead className="text-end">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>
                <div className="font-medium">{book.title}</div>
                <div className="text-sm text-muted-foreground">
                  {book.author.name}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{book.category.name}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={book.active ? "default" : "outline"}>
                  {book.active ? "منشور" : "مسودة"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {book.downloads}
                </div>
              </TableCell>
              <TableCell>{formatDate(book.createdAt)}</TableCell>
              <TableCell>
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewClick(book)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/books/${book.id}`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(book)}
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
            book: open ? deleteDialog.book : null,
          })
        }
        title="حذف الكتاب"
        description={`هل أنت متأكد من حذف الكتاب "${deleteDialog.book?.title}"؟`}
        warningTitle="تحذير"
        warningMessage="سيتم حذف هذا الكتاب نهائياً ولا يمكن استرجاعه."
        confirmText="حذف"
        cancelText="إلغاء"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        variant="destructive"
      />

      <ViewBookDialog
        open={viewDialog.open}
        onOpenChange={(open) =>
          setViewDialog({ open, book: open ? viewDialog.book : null })
        }
        book={viewDialog.book}
      />
    </>
  );
}
