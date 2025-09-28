"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AuthorCombobox from "@/components/admin/books/AuthorCombobox";
import TagsCombobox from "@/components/admin/books/TagsCombobox";
import FileDropzone from "@/components/admin/books/FileDropzone";
import CategorySelect from "@/components/admin/books/CategorySelect";
import LanguageSelect from "@/components/admin/books/LanguageSelect";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Validation schema including file fields
const bookSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان الكتاب مطلوب")
    .max(200, "يجب أن يكون العنوان أقل من 200 حرف"),
  description: z.string().min(1, "وصف الكتاب مطلوب"),
  author: z
    .union([z.number(), z.string()])
    .refine((val) => val !== null && val !== "", { message: "المؤلف مطلوب" }),
  categoryId: z.number().min(1, "فئة الكتاب مطلوبة"),
  language: z.string().min(1, "اللغة مطلوبة"),
  tags: z.array(z.union([z.number(), z.string()])).optional(),
  coverPhoto: z.union([z.string(), z.instanceof(File)]).optional(),
  pdfFile: z.union([z.string(), z.instanceof(File)]).optional(),
});

type BookFormData = z.infer<typeof bookSchema>;

interface Book {
  id: number;
  title: string;
  description: string;
  author: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  language: string;
  coverPhoto: string | null;
  fileUrl: string;
  tags: Array<{
    id: number;
    name: string;
  }>;
}

interface BookFormProps {
  initialBook?: Book;
}

const BookForm = ({ initialBook }: BookFormProps) => {
  const router = useRouter();
  const mode = initialBook ? "edit" : "create";
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      author: initialBook?.author.id || "",
      categoryId: initialBook?.category.id || 0,
      language: initialBook?.language || "",
      tags: initialBook?.tags.map((tag) => tag.id) || [],
      coverPhoto: initialBook?.coverPhoto || undefined,
      pdfFile: initialBook?.fileUrl || undefined,
    },
  });

  // Watch form values
  const watchedAuthor = watch("author");
  const watchedCategoryId = watch("categoryId");
  const watchedLanguage = watch("language");
  const watchedTags = watch("tags");
  const watchedCoverPhoto = watch("coverPhoto");
  const watchedPdfFile = watch("pdfFile");

  const data = watch();
  console.log("-------------------- data --------------------");
  console.log(data);

  // Populate form with initial book data
  useEffect(() => {
    if (mode === "edit" && initialBook) {
      // Reset form with existing data
      reset({
        title: initialBook.title,
        description: initialBook.description,
        author: initialBook.author.id,
        categoryId: initialBook.category.id,
        language: initialBook.language,
        tags: initialBook.tags.map((tag) => tag.id),
        coverPhoto: initialBook.coverPhoto || undefined,
        pdfFile: initialBook.fileUrl || undefined,
      });
    }
  }, [initialBook, mode, reset]);

  // Enhanced schema validation that includes file requirements
  const createModeSchema = bookSchema.extend({
    pdfFile: z
      .union([z.string(), z.instanceof(File)])
      .refine((val) => val !== undefined, { message: "ملف PDF مطلوب" }),
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
    try {
      const formData = new FormData();

      // Add text fields from form data
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append(
        "author",
        typeof data.author === "number"
          ? data.author.toString()
          : data.author?.toString() || ""
      );
      formData.append("categoryId", data.categoryId?.toString() || "");
      formData.append("language", data.language);
      formData.append("tags", JSON.stringify(data.tags || []));

      // Add files only if provided and they are File objects (new uploads)
      if (data.coverPhoto && data.coverPhoto instanceof File) {
        formData.append("coverPhoto", data.coverPhoto);
      }
      if (data.pdfFile && data.pdfFile instanceof File) {
        formData.append("fileUrl", data.pdfFile);
      }

      if (mode === "create") {
        await axios.post("/api/books", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.put(`/api/books/${initialBook!.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Success - redirect to books list
      router.push("/admin/books");
    } catch (error: any) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} book:`,
        error
      );
      // You might want to show a toast notification here
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
              العودة للكتب
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {mode === "create" ? "إضافة كتاب جديد" : "تعديل الكتاب"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "create"
                ? "أضف كتاباً جديداً إلى المكتبة"
                : "تعديل معلومات الكتاب المحدد"}
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الكتاب</CardTitle>
              <CardDescription>
                املأ جميع الحقول المطلوبة{" "}
                {mode === "create" ? "لإضافة" : "لتعديل"} الكتاب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان الكتاب *</Label>
                    <Input
                      id="title"
                      placeholder="مثال: أحكام الصلاة"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">المؤلف *</Label>
                    <AuthorCombobox
                      value={watchedAuthor}
                      onChange={(value) => {
                        setValue("author", value || "", {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      placeholder="اختر أو أضف مؤلف..."
                      disabled={isSubmitting}
                    />
                    {errors.author && (
                      <p className="text-sm text-destructive">
                        {errors.author.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف الكتاب *</Label>
                  <Textarea
                    id="description"
                    placeholder="وصف مختصر عن محتوى الكتاب..."
                    rows={4}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">الفئة *</Label>
                    <CategorySelect
                      value={watchedCategoryId}
                      onChange={(value) => {
                        setValue("categoryId", value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      disabled={isSubmitting}
                    />
                    {errors.categoryId && (
                      <p className="text-sm text-destructive">
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">اللغة *</Label>
                    <LanguageSelect
                      value={watchedLanguage}
                      onChange={(value) => {
                        setValue("language", value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      disabled={isSubmitting}
                    />
                    {errors.language && (
                      <p className="text-sm text-destructive">
                        {errors.language.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    صورة الغلاف
                    {mode === "edit" && initialBook?.coverPhoto && (
                      <span className="text-sm text-muted-foreground ml-2">
                        (اترك فارغاً للاحتفاظ بالصورة الحالية)
                      </span>
                    )}
                  </Label>
                  <FileDropzone
                    onDrop={handleCoverPhotoDrop}
                    accept={{
                      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
                    }}
                    maxSize={20 * 1024 * 1024} // 20MB
                    value={watchedCoverPhoto}
                    onRemove={handleRemoveCoverPhoto}
                    placeholder="اسحب وأفلت صورة الغلاف هنا أو انقر للاختيار"
                    disabled={isSubmitting}
                  />
                  {errors.coverPhoto && (
                    <p className="text-sm text-destructive">
                      {errors.coverPhoto.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    ملف PDF {mode === "create" ? "*" : ""}
                    {mode === "edit" && (
                      <span className="text-sm text-muted-foreground ml-2">
                        (اترك فارغاً للاحتفاظ بالملف الحالي)
                      </span>
                    )}
                  </Label>
                  <FileDropzone
                    onDrop={handlePdfDrop}
                    accept={{
                      "application/pdf": [".pdf"],
                    }}
                    maxSize={200 * 1024 * 1024} // 200MB
                    value={watchedPdfFile}
                    onRemove={handleRemovePdf}
                    placeholder="اسحب وأفلت ملف PDF هنا أو انقر للاختيار"
                    disabled={isSubmitting}
                  />
                  {errors.pdfFile && (
                    <p className="text-sm text-destructive">
                      {errors.pdfFile.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>الكلمات المفتاحية</Label>
                  <TagsCombobox
                    value={watchedTags || []}
                    onChange={(value) => {
                      setValue("tags", value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    placeholder="اختر أو أضف كلمات مفتاحية..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={
                      isSubmitting ||
                      (mode === "create" && !watchedPdfFile) ||
                      (mode === "edit" && !isDirty)
                    }
                  >
                    {isSubmitting
                      ? "جاري الحفظ..."
                      : mode === "create"
                      ? "حفظ ونشر الكتاب"
                      : isDirty
                      ? "حفظ التعديلات"
                      : "لا توجد تغييرات"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={() => router.push("/admin/books")}
                  >
                    إلغاء
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
