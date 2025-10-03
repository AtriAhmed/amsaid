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

const createEditPersonSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("person name required"))
      .max(100, t("person name less than 100 chars")),
    bio: z.string().optional(),
  });

type EditPersonForm = z.infer<ReturnType<typeof createEditPersonSchema>>;

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

interface EditPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: Person | null;
  onPersonUpdated: () => void;
}

export default function EditPersonDialog({
  open,
  onOpenChange,
  person,
  onPersonUpdated,
}: EditPersonDialogProps) {
  const t = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPersonForm>();

  useEffect(() => {
    if (person && open) {
      reset({
        name: person.name,
        bio: person.bio || "",
      });
    }
  }, [person, open, reset]);

  const onSubmit = async (data: EditPersonForm) => {
    if (!person) return;

    try {
      setIsLoading(true);

      // Validate with Zod using translated messages
      const editPersonSchema = createEditPersonSchema(t);
      const validatedData = editPersonSchema.parse(data);

      await axios.put(`/api/people/${person.id}`, validatedData);

      // Success
      onOpenChange(false);
      onPersonUpdated();
    } catch (error: any) {
      console.error("Error updating person:", error);
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
          <DialogTitle>{t("edit person")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("person name")} *</Label>
              <Input
                id="name"
                placeholder={t("example dr ahmed")}
                {...register("name", {
                  required: t("person name required"),
                  maxLength: {
                    value: 100,
                    message: t("person name less than 100 chars"),
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
            <div className="space-y-2">
              <Label htmlFor="bio">
                {t("biography")} ({t("optional")})
              </Label>
              <Textarea
                id="bio"
                placeholder={t("person biography")}
                {...register("bio")}
                disabled={isLoading}
                rows={4}
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
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
              {isLoading ? t("saving") : t("save changes")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
