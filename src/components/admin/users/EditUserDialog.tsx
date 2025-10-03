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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role, User } from "@/types";

// Validation schema
const editUserSchema = z.object({
  name: z.string().min(1, "name required").max(100, "name less than 100 chars"),
  email: z.string().email("invalid email format"),
  password: z
    .string()
    .min(6, "password at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.enum([Role.OWNER, Role.MANAGER, Role.ADMIN]),
});

type EditUserForm = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export default function EditUserDialog({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: EditUserDialogProps) {
  const t = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || undefined,
        email: user.email,
        role: user.role,
        password: "", // Don't pre-fill password
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: EditUserForm) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Don't send password if it's empty
      const updateData: any = { ...data };
      if (!updateData.password || updateData.password === "") {
        delete updateData.password;
      }

      await axios.put(`/api/users/${user.id}`, updateData);

      // Success
      onOpenChange(false);
      onUserUpdated();
    } catch (error: any) {
      console.error("Error updating user:", error);
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
          <DialogTitle>{t("edit user")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t("name")} *</Label>
              <Input
                id="edit-name"
                placeholder={t("enter user name")}
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
              <Label htmlFor="edit-email">{t("email")} *</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder={t("enter email address")}
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {t(errors.email.message as any)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">{t("password")}</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder={t("leave empty to keep current password")}
                {...register("password")}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {t("leave empty to keep current password")}
              </p>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {t(errors.password.message as any)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">{t("role")} *</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select role")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Role.ADMIN}>{t("admin")}</SelectItem>
                      <SelectItem value={Role.MANAGER}>
                        {t("manager")}
                      </SelectItem>
                      <SelectItem value={Role.OWNER}>{t("owner")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-sm text-destructive">
                  {t(errors.role.message as any)}
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
