import { useState } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

// Note: We'll need to handle validation messages dynamically
const createPersonSchema = z.object({
  name: z
    .string()
    .min(1, "person name required")
    .max(100, "person name less than 100 chars"),
  bio: z.string().optional(),
});

type CreatePersonForm = z.infer<typeof createPersonSchema>;

interface CreatePersonDialogProps {
  onPersonCreated: () => void;
}

export default function CreatePersonDialog({
  onPersonCreated,
}: CreatePersonDialogProps) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePersonForm>({
    resolver: zodResolver(createPersonSchema),
  });

  const onSubmit = async (data: CreatePersonForm) => {
    try {
      setIsLoading(true);

      // Validate with Zod
      const validatedData = createPersonSchema.parse(data);

      await axios.post("/api/people", validatedData);

      // Success
      reset();
      setOpen(false);
      onPersonCreated();
    } catch (error: any) {
      console.error("Error creating person:", error);
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
          {t("add new person")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("add new person")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("person name")} *</Label>
              <Input
                id="name"
                placeholder={t("example dr ahmed")}
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {t(errors.name.message as any)}
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
                <p className="text-sm text-destructive">
                  {t(errors.bio.message as any)}
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
              {isLoading ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
