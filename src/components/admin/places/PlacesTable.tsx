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
import { Edit, MapPin, Trash2, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import PlaceDialog from "@/components/admin/places/PlaceDialog";

interface Place {
  id: number;
  name: string;
  address?: string | null;
  _count: {
    videos: number;
  };
}

interface PlacesTableProps {
  places: Place[];
  onPlaceDeleted: () => void;
  onPlaceUpdated?: () => void;
}

export default function PlacesTable({
  places,
  onPlaceDeleted,
  onPlaceUpdated,
}: PlacesTableProps) {
  const t = useTranslations("common");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    place: Place | null;
  }>({
    open: false,
    place: null,
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    place: Place | null;
  }>({
    open: false,
    place: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (place: Place) => {
    setDeleteDialog({
      open: true,
      place,
    });
  };

  const handleEditClick = (place: Place) => {
    setEditDialog({
      open: true,
      place,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.place) return;

    try {
      setIsDeleting(true);

      await axios.delete(`/api/places/${deleteDialog.place.id}`);

      // Success
      setDeleteDialog({ open: false, place: null });
      onPlaceDeleted();
    } catch (error: any) {
      console.error("Error deleting place:", error);
      // You might want to show a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlaceUpdated = () => {
    setEditDialog({ open: false, place: null });
    onPlaceUpdated?.();
  };

  const canDelete = (place: Place) => {
    return place?._count.videos === 0;
  };

  if (places.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{t("no places available")}</p>
      </div>
    );
  }

  return (
    <>
      <Table className="min-w-[400px]">
        <TableHeader>
          <TableRow>
            <TableHead className="text-start">{t("place name")}</TableHead>
            <TableHead className="text-start">{t("address")}</TableHead>
            <TableHead className="text-start">{t("videos count")}</TableHead>
            <TableHead className="text-start">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {places.map((place) => (
            <TableRow key={place.id}>
              <TableCell>
                <div className="font-medium">{place.name}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground max-w-xs">
                  {place.address || t("no address")}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 w-fit"
                >
                  <Video className="h-3 w-3" />
                  {place._count.videos} {t("video")}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(place)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(place)}
                    disabled={!canDelete(place)}
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
            place: open ? deleteDialog.place : null,
          })
        }
        title={t("delete place")}
        description={`${t("are you sure delete place")} "${
          deleteDialog.place?.name
        }"؟`}
        warningTitle={t("warning")}
        warningMessage={
          canDelete(deleteDialog.place!)
            ? t("place will be deleted permanently")
            : `${t("cannot delete place has videos")} ${
                deleteDialog.place?._count.videos || 0
              } ${t("videos")}.`
        }
        confirmText={t("delete")}
        cancelText={t("cancel")}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        variant="destructive"
        disabled={deleteDialog.place ? !canDelete(deleteDialog.place) : false}
      />

      {editDialog.open && (
        <PlaceDialog
          open={editDialog.open}
          onOpenChange={(open: boolean) =>
            setEditDialog({ open, place: open ? editDialog.place : null })
          }
          place={editDialog.place}
          onPlaceUpdated={handlePlaceUpdated}
        />
      )}
    </>
  );
}
