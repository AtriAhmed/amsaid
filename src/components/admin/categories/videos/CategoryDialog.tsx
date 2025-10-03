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

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    videos: number;
  };
}

const createCategorySchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("category name required"))
      .max(100, t("category name less than 100 chars")),
  });

type CategoryForm = z.infer<ReturnType<typeof createCategorySchema>>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onCategoryCreated?: () => void;
  onCategoryUpdated?: () => void;
}
export default function CategoryDialog({
  open,
  onOpenChange,
  category,
  onCategoryCreated,
  onCategoryUpdated,
}: CategoryDialogProps) {
  const t = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);

  // Determine if this is create or edit mode
  const isEditMode = !!category;
  const isCreateMode = !isEditMode;

  const categorySchema = createCategorySchema(t);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });

  // Reset form when dialog opens and category data is available (edit mode)
  useEffect(() => {
    if (category && open) {
      reset({
        name: category.name,
      });
    } else if (!category && open) {
      // Create mode - reset to empty values
      reset({
        name: "",
      });
    }
  }, [category, open, reset]);

  const onSubmit = async (data: CategoryForm) => {
    try {
      setIsLoading(true);

      // Validate with Zod
      const validatedData = categorySchema.parse(data);

      if (isEditMode && category) {
        // Update existing category
        await axios.put(`/api/categories/videos/${category.id}`, validatedData);
        onOpenChange(false);
        onCategoryUpdated?.();
      } else {
        // Create new category
        await axios.post("/api/categories/videos", validatedData);
        reset();
        onOpenChange(false);
        onCategoryCreated?.();
      }
    } catch (error: any) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} category:`,
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
          {isEditMode ? t("edit video category") : t("add new video category")}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("category name")} *</Label>
            <Input
              id="name"
              placeholder={t("example fiqh")}
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
