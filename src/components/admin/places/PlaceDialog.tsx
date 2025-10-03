import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Place {
  id: number;
  name: string;
  address?: string | null;
  _count: {
    videos: number;
  };
}

const createPlaceSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("place name required"))
      .max(100, t("place name less than 100 chars")),
    address: z.string().optional(),
  });

type PlaceForm = z.infer<ReturnType<typeof createPlaceSchema>>;

interface PlaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place?: Place | null;
  onPlaceCreated?: () => void;
  onPlaceUpdated?: () => void;
}

export default function PlaceDialog({
  open,
  onOpenChange,
  place,
  onPlaceCreated,
  onPlaceUpdated,
}: PlaceDialogProps) {
  const t = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);

  // Determine if this is create or edit mode
  const isEditMode = !!place;
  const isCreateMode = !isEditMode;

  const placeSchema = createPlaceSchema(t);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlaceForm>({
    resolver: zodResolver(placeSchema),
  });

  // Reset form when dialog opens and place data is available (edit mode)
  useEffect(() => {
    if (place && open) {
      reset({
        name: place.name,
        address: place.address || "",
      });
    } else if (!place && open) {
      // Create mode - reset to empty values
      reset({
        name: "",
        address: "",
      });
    }
  }, [place, open, reset]);

  const onSubmit = async (data: PlaceForm) => {
    try {
      setIsLoading(true);

      // Validate with Zod
      const validatedData = placeSchema.parse(data);

      if (isEditMode && place) {
        // Update existing place
        await axios.put(`/api/places/${place.id}`, validatedData);
        onOpenChange(false);
        onPlaceUpdated?.();
      } else {
        // Create new place
        await axios.post("/api/places", validatedData);
        reset();
        onOpenChange(false);
        onPlaceCreated?.();
      }
    } catch (error: any) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} place:`,
        error
      );
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        reset();
      }
    }
  };

  const dialogContent = (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditMode ? t("edit place") : t("add new place")}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("place name")} *</Label>
            <Input
              id="name"
              placeholder={t("example mosque name")}
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{t("address")}</Label>
            <Textarea
              id="address"
              placeholder={t("place address optional")}
              {...register("address")}
              disabled={isLoading}
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? t("saving")
              : isEditMode
              ? t("save changes")
              : t("save")}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
