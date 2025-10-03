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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Tag {
  id: number;
  name: string;
  _count: {
    books: number;
    videos: number;
  };
}

const createTagSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("tag name required"))
      .max(50, t("tag name less than 50 chars")),
  });

type TagForm = z.infer<ReturnType<typeof createTagSchema>>;

interface TagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: Tag | null;
  onTagCreated?: () => void;
  onTagUpdated?: () => void;
}

export default function TagDialog({
  open,
  onOpenChange,
  tag,
  onTagCreated,
  onTagUpdated,
}: TagDialogProps) {
  const t = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);

  // Determine if this is create or edit mode
  const isEditMode = !!tag;
  const isCreateMode = !isEditMode;

  const tagSchema = createTagSchema(t);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TagForm>({
    resolver: zodResolver(tagSchema),
  });

  // Reset form when dialog opens and tag data is available (edit mode)
  useEffect(() => {
    if (tag && open) {
      reset({
        name: tag.name,
      });
    } else if (!tag && open) {
      // Create mode - reset to empty values
      reset({
        name: "",
      });
    }
  }, [tag, open, reset]);

  const onSubmit = async (data: TagForm) => {
    try {
      setIsLoading(true);

      // Validate with Zod
      const validatedData = tagSchema.parse(data);

      if (isEditMode && tag) {
        // Update existing tag
        await axios.put(`/api/tags/${tag.id}`, validatedData);
        onOpenChange(false);
        onTagUpdated?.();
      } else {
        // Create new tag
        await axios.post("/api/tags", validatedData);
        reset();
        onOpenChange(false);
        onTagCreated?.();
      }
    } catch (error: any) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} tag:`,
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
          {isEditMode ? t("edit tag") : t("add new tag")}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("tag name")} *</Label>
            <Input
              id="name"
              placeholder={t("example science")}
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
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
