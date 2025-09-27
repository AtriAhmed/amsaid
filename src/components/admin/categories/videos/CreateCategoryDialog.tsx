import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "اسم الفئة مطلوب")
    .max(100, "يجب أن يكون اسم الفئة أقل من 100 حرف"),
});

type CreateCategoryForm = z.infer<typeof createCategorySchema>;

interface CreateCategoryDialogProps {
  onCategoryCreated: () => void;
}

export default function CreateCategoryDialog({
  onCategoryCreated,
}: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryForm>({
    resolver: zodResolver(createCategorySchema),
  });

  const onSubmit = async (data: CreateCategoryForm) => {
    try {
      setIsLoading(true);

      // Validate with Zod
      const validatedData = createCategorySchema.parse(data);

      await axios.post("/api/categories/videos", validatedData);

      // Success
      reset();
      setOpen(false);
      onCategoryCreated();
    } catch (error: any) {
      console.error("Error creating category:", error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      if (!newOpen) {
        reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 ml-2" />
          إضافة فئة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة فئة فيديوهات جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الفئة *</Label>
              <Input
                id="name"
                placeholder="مثال: الفقه"
                {...register("name")}
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
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
