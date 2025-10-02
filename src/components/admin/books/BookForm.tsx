"use client";

import AuthorCombobox from "@/components/admin/books/AuthorCombobox";
import CategorySelect from "@/components/admin/books/CategorySelect";
import FileDropzone from "@/components/admin/books/FileDropzone";
import LanguageSelect from "@/components/admin/books/LanguageSelect";
import TagsCombobox from "@/components/admin/books/TagsCombobox";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Book } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import UploadProgressIndicator, {
  UploadStatus,
  UploadFileType,
} from "@/components/ui/UploadProgressIndicator";

// Schema will be created inside the component to access translations
type BookFormData = {
  title: string;
  description?: string;
  author: number | string;
  categoryId: number;
  language: string;
  tags?: (number | string)[];
  active?: boolean;
  coverPhoto?: File | string;
  pdfFile?: File | string;
};

interface BookFormProps {
  initialBook?: Book;
}

const BookForm = ({ initialBook }: BookFormProps) => {
  const t = useTranslations("common");
  const router = useRouter();
  const mode = initialBook ? "edit" : "create";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    status: "idle" as UploadStatus,
    progress: 0,
    fileType: null as UploadFileType,
  });

  // Create dynamic schema with translations
  const bookSchema = z.object({
    title: z
      .string()
      .min(1, t("book title required"))
      .max(200, t("book title less than 200 chars")),
    description: z.string().optional(),
    author: z
      .union([z.number(), z.string()])
      .refine((val) => val !== null && val !== "", {
        message: t("author required"),
      }),
    categoryId: z.number().min(1, t("category required")),
    language: z.string().min(1, t("language required")),
    tags: z.array(z.union([z.number(), z.string()])).optional(),
    active: z.boolean().optional(),
    coverPhoto: z
      .union([z.string(), z.instanceof(File)])
      .optional()
      .refine((val) => val !== undefined, {
        message: t("cover photo required"),
      }),
    pdfFile: z
      .union([z.string(), z.instanceof(File)])
      .optional()
      .refine((val) => val !== undefined, {
        message: t("pdf file required"),
      }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: initialBook?.title || "",
      description: initialBook?.description || "",
      author: initialBook?.author?.id || "",
      categoryId: initialBook?.category?.id || 0,
      language: initialBook?.language || "",
      tags: initialBook?.tags?.map((tag) => tag.id) || [],
      coverPhoto: initialBook?.coverPhoto || undefined,
      pdfFile: initialBook?.fileUrl || undefined,
      active: initialBook?.active !== undefined ? initialBook.active : true,
    },
  });

  const data = watch();

  // Populate form with initial book data
  useEffect(() => {
    if (mode === "edit" && initialBook) {
      // Reset form with existing data
      reset({
        title: initialBook.title,
        description: initialBook.description,
        author: initialBook.author?.id,
        categoryId: initialBook.category?.id,
        language: initialBook.language,
        tags: initialBook.tags?.map((tag) => tag.id),
        coverPhoto: initialBook.coverPhoto || undefined,
        pdfFile: initialBook.fileUrl || undefined,
        active: initialBook.active !== undefined ? initialBook.active : true,
      });
    }
  }, [initialBook, mode, reset]);

  // Enhanced schema validation that includes file requirements
  const createModeSchema = bookSchema.extend({
    pdfFile: z
      .union([z.string(), z.instanceof(File)])
      .refine((val) => val !== undefined, { message: t("pdf file required") }),
  });

  const onSubmit = async (data: BookFormData) => {
    // Additional validation for create mode
    if (mode === "create") {
      const result = createModeSchema.safeParse(data);
      if (!result.success) {
        // Handle validation errors
        result.error.issues.forEach((issue) => {
          if (issue.path[0] === "pdfFile") {
            // Trigger validation to show error
            setValue("pdfFile", data.pdfFile, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }
        });
        return;
      }
    }

    setIsSubmitting(true);

    // Determine which files are being uploaded
    const hasNewCoverPhoto = data.coverPhoto && data.coverPhoto instanceof File;
    const hasNewPdf = data.pdfFile && data.pdfFile instanceof File;
    const hasFilesToUpload = hasNewCoverPhoto || hasNewPdf;

    try {
      const formData = new FormData();

      // Add text fields from form data
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append(
        "author",
        typeof data.author === "number"
          ? data.author.toString()
          : data.author?.toString() || ""
      );
      formData.append("categoryId", data.categoryId?.toString() || "");
      formData.append("language", data.language);
      formData.append("tags", JSON.stringify(data.tags || []));
      formData.append(
        "active",
        (data.active !== undefined ? data.active : true).toString()
      );

      // Only initialize upload state if there are files to upload
      if (hasFilesToUpload) {
        setUploadState({
          status: "uploading",
          progress: 0,
          fileType: hasNewCoverPhoto ? "poster" : "video",
        });
      }

      // Add files only if provided and they are File objects (new uploads)
      if (hasNewCoverPhoto) {
        formData.append("coverPhoto", data.coverPhoto as File);
      }
      if (hasNewPdf) {
        formData.append("fileUrl", data.pdfFile as File);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        ...(hasFilesToUpload && {
          onUploadProgress: (progressEvent: any) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadState((prev) => ({ ...prev, progress }));
          },
        }),
      };

      if (mode === "create") {
        await axios.post("/api/books", formData, config);
      } else {
        await axios.put(`/api/books/${initialBook!.id}`, formData, config);
      }

      if (hasFilesToUpload) {
        setUploadState((prev) => ({ ...prev, status: "success" }));
      }

      // Small delay to show success state
      setTimeout(
        () => {
          router.push("/admin/books");
        },
        hasFilesToUpload ? 1000 : 0
      );
    } catch (error: any) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} book:`,
        error
      );

      if (hasFilesToUpload) {
        setUploadState((prev) => ({ ...prev, status: "error" }));
        // Reset after showing error
        setTimeout(() => {
          setUploadState({
            status: "idle",
            progress: 0,
            fileType: null,
          });
        }, 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverPhotoDrop = (files: File[]) => {
    if (files.length > 0) {
      setValue("coverPhoto", files[0], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handlePdfDrop = (files: File[]) => {
    if (files.length > 0) {
      setValue("pdfFile", files[0], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleRemoveCoverPhoto = () => {
    setValue("coverPhoto", undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleRemovePdf = () => {
    setValue("pdfFile", undefined, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/books">
              <ArrowRight className="w-4 h-4 ml-2" />
              {t("back to books")}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {mode === "create" ? t("add new book") : t("edit book")}
            </h1>
            <p className="text-muted-foreground">
              {mode === "create"
                ? t("add new book to library")
                : t("edit selected book info")}
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("book information")}</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="active" className="text-sm font-medium">
                    {t("published")}
                  </Label>
                  <Switch
                    id="active"
                    checked={data.active !== undefined ? data.active : true}
                    onCheckedChange={(checked: boolean) => {
                      setValue("active", checked, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <CardDescription>
                {mode === "create"
                  ? t("fill all required fields to add")
                  : t("fill all required fields to edit")}{" "}
                {t("book")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t("book title")} *</Label>
                    <Input
                      id="title"
                      placeholder={t("book title example")}
                      {...register("title")}
                      defaultValue={data.title}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* <div
                      tabIndex={-1}
                      ref={register("author")?.ref}
                      className="sr-only"
                    ></div> */}
                    <Label htmlFor="author">{t("author")} *</Label>
                    <AuthorCombobox
                      value={data.author}
                      onChange={(value) => {
                        setValue("author", value || "", {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      placeholder={t("choose or add author")}
                      disabled={isSubmitting}
                      ref={register("author")?.ref}
                    />
                    {errors.author && (
                      <p className="text-sm text-destructive">
                        {errors.author.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("book description")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("book description placeholder")}
                    rows={4}
                    {...register("description")}
                    defaultValue={data.description}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">{t("category")} *</Label>
                    <CategorySelect
                      value={data.categoryId || undefined}
                      onChange={(value) =>
                        setValue("categoryId", value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      disabled={isSubmitting}
                      ref={register("categoryId")?.ref}
                    />
                    {errors.categoryId && (
                      <p className="text-sm text-destructive">
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">{t("language")} *</Label>
                    <LanguageSelect
                      value={data.language}
                      onChange={(value) => {
                        setValue("language", value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      disabled={isSubmitting}
                      ref={register("language")?.ref}
                    />
                    {errors.language && (
                      <p className="text-sm text-destructive">
                        {errors.language.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div
                    tabIndex={-1}
                    ref={register("coverPhoto")?.ref}
                    className="sr-only translate-y-[100px]"
                  ></div>
                  <Label>{t("cover photo")} *</Label>
                  <FileDropzone
                    onDrop={handleCoverPhotoDrop}
                    accept={{
                      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
                    }}
                    maxSize={20 * 1024 * 1024} // 20MB
                    value={data.coverPhoto}
                    onRemove={handleRemoveCoverPhoto}
                    placeholder={t("drag and drop cover photo")}
                    disabled={isSubmitting}
                  />
                  {errors.coverPhoto && (
                    <p className="text-sm text-destructive">
                      {errors.coverPhoto.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div
                    tabIndex={-1}
                    ref={register("pdfFile")?.ref}
                    className="sr-only translate-y-[100px]"
                  ></div>
                  <Label>{t("pdf file")} *</Label>
                  <FileDropzone
                    onDrop={handlePdfDrop}
                    accept={{
                      "application/pdf": [".pdf"],
                    }}
                    maxSize={500 * 1024 * 1024}
                    value={data.pdfFile}
                    onRemove={handleRemovePdf}
                    placeholder={t("drag and drop pdf file")}
                    disabled={isSubmitting}
                  />
                  {errors.pdfFile && (
                    <p className="text-sm text-destructive">
                      {errors.pdfFile.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("keywords")}</Label>
                  <TagsCombobox
                    value={data.tags || []}
                    onChange={(value) => {
                      setValue("tags", value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    placeholder={t("choose or add keywords")}
                    disabled={isSubmitting}
                  />
                </div>

                {uploadState.status !== "idle" && (
                  <UploadProgressIndicator
                    status={uploadState.status}
                    progress={uploadState.progress}
                    fileType={uploadState.fileType}
                  />
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting || (mode === "edit" && !isDirty)}
                  >
                    {isSubmitting
                      ? t("saving")
                      : mode === "create"
                      ? t("save and publish book")
                      : isDirty
                      ? t("save changes")
                      : t("no changes")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={() => router.push("/admin/books")}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookForm;
