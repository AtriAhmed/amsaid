import { useState, useEffect } from "react";
import axios from "axios";
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

const editCategorySchema = z.object({
  name: z
    .string()
    .min(1, "اسم الفئة مطلوب")
    .max(100, "يجب أن يكون اسم الفئة أقل من 100 حرف"),
});

type EditCategoryForm = z.infer<typeof editCategorySchema>;

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    videos: number;
  };
}

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onCategoryUpdated: () => void;
}

export default function EditCategoryDialog({
  open,
  onOpenChange,
  category,
  onCategoryUpdated,
}: EditCategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCategoryForm>();

  useEffect(() => {
    if (category && open) {
      reset({
        name: category.name,
      });
    }
  }, [category, open, reset]);

  const onSubmit = async (data: EditCategoryForm) => {
    if (!category) return;

    try {
      setIsLoading(true);

      // Validate with Zod
      const validatedData = editCategorySchema.parse(data);

      await axios.put(`/api/categories/videos/${category.id}`, validatedData);

      // Success
      onOpenChange(false);
      onCategoryUpdated();
    } catch (error: any) {
      console.error("Error updating category:", error);
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل فئة الفيديوهات</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الفئة *</Label>
              <Input
                id="name"
                placeholder="مثال: الفقه"
                {...register("name", {
                  required: "اسم الفئة مطلوب",
                  maxLength: {
                    value: 100,
                    message: "يجب أن يكون اسم الفئة أقل من 100 حرف",
                  },
                })}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
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
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
