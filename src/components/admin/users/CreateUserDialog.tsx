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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@/types";
import { useSession } from "next-auth/react";

// Validation schema
const createUserSchema = z.object({
  name: z.string().min(1, "name required").max(100, "name less than 100 chars"),
  email: z.string().email("invalid email format"),
  password: z.string().min(6, "password at least 6 characters"),
  role: z.enum([Role.OWNER, Role.MANAGER, Role.ADMIN]),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
  onUserCreated: () => void;
}

export default function CreateUserDialog({
  onUserCreated,
}: CreateUserDialogProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: Role.ADMIN,
    },
  });

  const onSubmit = async (data: CreateUserForm) => {
    try {
      setIsLoading(true);

      // Validate with Zod
      const validatedData = createUserSchema.parse(data);

      await axios.post("/api/users", validatedData);

      // Success
      reset();
      setOpen(false);
      onUserCreated();
    } catch (error: any) {
      console.error("Error creating user:", error);
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
          {t("add new user")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("add new user")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")} *</Label>
              <Input
                id="name"
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
              <Label htmlFor="email">{t("email")} *</Label>
              <Input
                id="email"
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
              <Label htmlFor="password">{t("password")} *</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("enter password")}
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {t(errors.password.message as any)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t("role")} *</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("select role")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Role.ADMIN}>{t("admin")}</SelectItem>
                      <SelectItem
                        disabled={user?.role === Role.MANAGER}
                        value={Role.MANAGER}
                      >
                        {t("manager")}
                      </SelectItem>
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
