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
import { BookOpen, Edit, Trash2, User, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Person {
  id: number;
  name: string;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    books: number;
    videos: number;
  };
}

interface PeopleTableProps {
  people: Person[];
  onPersonDeleted: () => void;
  onPersonUpdated?: () => void;
}

export default function PeopleTable({
  people,
  onPersonDeleted,
  onPersonUpdated,
}: PeopleTableProps) {
  const t = useTranslations("common");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    person: Person | null;
  }>({
    open: false,
    person: null,
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    person: Person | null;
  }>({
    open: false,
    person: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (person: Person) => {
    setDeleteDialog({
      open: true,
      person,
    });
  };

  const handleEditClick = (person: Person) => {
    setEditDialog({
      open: true,
      person,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.person) return;

    try {
      setIsDeleting(true);

      await axios.delete(`/api/people/${deleteDialog.person.id}`);

      // Success
      setDeleteDialog({ open: false, person: null });
      onPersonDeleted();
    } catch (error: any) {
      console.error("Error deleting person:", error);
      // You might want to show a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePersonUpdated = () => {
    setEditDialog({ open: false, person: null });
    onPersonUpdated?.();
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

  const canDelete = (person: Person) => {
    return person?._count.books === 0 && person?._count.videos === 0;
  };

  if (people.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{t("no people available")}</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("person name")}</TableHead>
            <TableHead>{t("biography")}</TableHead>
            <TableHead>{t("content count")}</TableHead>
            <TableHead>{t("creation date")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((person) => (
            <TableRow key={person.id}>
              <TableCell>
                <div className="font-medium">{person.name}</div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs truncate text-sm text-muted-foreground">
                  {person.bio || t("no biography")}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 w-fit"
                  >
                    <BookOpen className="h-3 w-3" />
                    {person._count.books} {t("book")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 w-fit"
                  >
                    <Video className="h-3 w-3" />
                    {person._count.videos} {t("video")}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>{formatDate(person.createdAt)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(person)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(person)}
                    disabled={!canDelete(person)}
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
            person: open ? deleteDialog.person : null,
          })
        }
        title={t("delete person")}
        description={`${t("are you sure delete person")} "${
          deleteDialog.person?.name
        }"؟`}
        warningTitle={t("warning")}
        warningMessage={
          canDelete(deleteDialog.person!)
            ? t("person will be deleted permanently")
            : `${t("cannot delete person has content")} ${
                (deleteDialog.person?._count.books || 0) +
                (deleteDialog.person?._count.videos || 0)
              } ${t("content items")}.`
        }
        confirmText={t("delete")}
        cancelText={t("cancel")}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        variant="destructive"
        disabled={deleteDialog.person ? !canDelete(deleteDialog.person) : false}
      />
    </>
  );
}
