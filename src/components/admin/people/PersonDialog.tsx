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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

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

const createPersonSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("person name required"))
      .max(100, t("person name less than 100 chars")),
    bio: z.string().optional(),
  });

type PersonForm = z.infer<ReturnType<typeof createPersonSchema>>;

interface PersonDialogProps {
  // For create mode - provide these props
  trigger?: React.ReactNode;
  onPersonCreated?: () => void;
  
  // For edit mode - provide these props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  person?: Person | null;
  onPersonUpdated?: () => void;
}

export default function PersonDialog({
  trigger,
  onPersonCreated,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  person,
  onPersonUpdated,
}: PersonDialogProps) {
  const t = useTranslations("common");
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Determine if this is create or edit mode
  const isEditMode = !!person;
  const isCreateMode = !isEditMode;

  // Use controlled or internal state for dialog open/close
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const personSchema = createPersonSchema(t);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonForm>({
    resolver: zodResolver(personSchema),
  });

  // Reset form when dialog opens and person data is available (edit mode)
  useEffect(() => {
    if (person && open) {
      reset({
        name: person.name,
        bio: person.bio || "",
      });
    } else if (!person && open) {
      // Create mode - reset to empty values
      reset({
        name: "",
        bio: "",
      });
    }
  }, [person, open, reset]);

  const onSubmit = async (data: PersonForm) => {
    try {
      setIsLoading(true);

      // Validate with Zod
      const validatedData = personSchema.parse(data);

      if (isEditMode && person) {
        // Update existing person
        await axios.put(`/api/people/${person.id}`, validatedData);
        setOpen(false);
        onPersonUpdated?.();
      } else {
        // Create new person
        await axios.post("/api/people", validatedData);
        reset();
        setOpen(false);
        onPersonCreated?.();
      }
    } catch (error: any) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} person:`,
        error
      );
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

  const dialogContent = (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditMode ? t("edit person") : t("add new person")}
        </DialogTitle>
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

  // For create mode, render with trigger
  if (isCreateMode && trigger) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  // For create mode without custom trigger, render default trigger
  if (isCreateMode) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 ml-2" />
            {t("add new person")}
          </Button>
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  // For edit mode, render without trigger (controlled externally)
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
