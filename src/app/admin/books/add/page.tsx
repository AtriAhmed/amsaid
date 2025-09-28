"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import useSWR from "swr";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import AuthorCombobox from "@/components/admin/books/AuthorCombobox";
import TagsCombobox from "@/components/admin/books/TagsCombobox";
import FileDropzone from "@/components/admin/books/FileDropzone";

// Validation schema for form fields only
const addBookSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان الكتاب مطلوب")
    .max(200, "يجب أن يكون العنوان أقل من 200 حرف"),
  description: z.string().min(1, "وصف الكتاب مطلوب"),
});

type AddBookForm = z.infer<typeof addBookSchema>;

interface BookCategory {
  id: number;
  name: string;
}

const LANGUAGES = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "الإنجليزية" },
  { value: "fr", label: "الفرنسية" },
  { value: "es", label: "الإسبانية" },
  { value: "de", label: "الألمانية" },
];

const AddBook = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [author, setAuthor] = useState<number | string | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [language, setLanguage] = useState<string>("");
  const [tags, setTags] = useState<(number | string)[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddBookForm>({
    resolver: zodResolver(addBookSchema),
  });

  // axios-based fetcher for SWR
  const fetcher = async (url: string) => {
    const res = await axios.get(url);
    return res.data;
  };

  // Fetch categories using SWR
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useSWR("/api/categories/books", fetcher);

  const categories = categoriesData?.data || [];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!author) {
      errors.author = "المؤلف مطلوب";
    }

    if (!categoryId) {
      errors.category = "فئة الكتاب مطلوبة";
    }

    if (!language) {
      errors.language = "اللغة مطلوبة";
    }

    if (!pdfFile) {
      errors.pdfFile = "ملف PDF مطلوب";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (data: AddBookForm) => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Add text fields
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append(
        "author",
        typeof author === "number" ? author.toString() : author || ""
      );
      formData.append("categoryId", categoryId?.toString() || "");
      formData.append("language", language);
      formData.append("tags", JSON.stringify(tags));

      // Add files
      if (coverPhoto) {
        formData.append("coverPhoto", coverPhoto);
      }
      if (pdfFile) {
        formData.append("fileUrl", pdfFile);
      }

      await axios.post("/api/books", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Success - redirect to books list
      router.push("/admin/books");
    } catch (error: any) {
      console.error("Error creating book:", error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverPhotoDrop = (files: File[]) => {
    if (files.length > 0) {
      setCoverPhoto(files[0]);
    }
  };

  const handlePdfDrop = (files: File[]) => {
    if (files.length > 0) {
      setPdfFile(files[0]);
      setFormErrors((prev) => ({ ...prev, pdfFile: "" }));
    }
  };

  const handleRemoveCoverPhoto = () => {
    setCoverPhoto(null);
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
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
            <h1 className="text-3xl font-bold mb-2">إضافة كتاب جديد</h1>
            <p className="text-muted-foreground">
              أضف كتاباً جديداً إلى المكتبة
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الكتاب</CardTitle>
              <CardDescription>
                املأ جميع الحقول المطلوبة لإضافة الكتاب
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
                      value={author}
                      onChange={(value) => {
                        setAuthor(value);
                        setFormErrors((prev) => ({ ...prev, author: "" }));
                      }}
                      placeholder="اختر أو أضف مؤلف..."
                      disabled={isSubmitting}
                    />
                    {formErrors.author && (
                      <p className="text-sm text-destructive">
                        {formErrors.author}
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
                    <Select
                      value={categoryId?.toString()}
                      onValueChange={(value) => {
                        setCategoryId(parseInt(value));
                        setFormErrors((prev) => ({ ...prev, category: "" }));
                      }}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            categoriesLoading
                              ? "جاري تحميل الفئات..."
                              : categoriesError
                              ? "خطأ في تحميل الفئات"
                              : "اختر الفئة"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: BookCategory) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.category && (
                      <p className="text-sm text-destructive">
                        {formErrors.category}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">اللغة *</Label>
                    <Select
                      value={language}
                      onValueChange={(value) => {
                        setLanguage(value);
                        setFormErrors((prev) => ({ ...prev, language: "" }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر اللغة" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.language && (
                      <p className="text-sm text-destructive">
                        {formErrors.language}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>صورة الغلاف</Label>
                  <FileDropzone
                    onDrop={handleCoverPhotoDrop}
                    accept={{
                      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
                    }}
                    maxSize={20 * 1024 * 1024} // 5MB
                    value={coverPhoto}
                    onRemove={handleRemoveCoverPhoto}
                    placeholder="اسحب وأفلت صورة الغلاف هنا أو انقر للاختيار"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>ملف PDF *</Label>
                  <FileDropzone
                    onDrop={handlePdfDrop}
                    accept={{
                      "application/pdf": [".pdf"],
                    }}
                    maxSize={200 * 1024 * 1024} // 50MB
                    value={pdfFile}
                    onRemove={handleRemovePdf}
                    placeholder="اسحب وأفلت ملف PDF هنا أو انقر للاختيار"
                    disabled={isSubmitting}
                  />
                  {formErrors.pdfFile && (
                    <p className="text-sm text-destructive">
                      {formErrors.pdfFile}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>الكلمات المفتاحية</Label>
                  <TagsCombobox
                    value={tags}
                    onChange={setTags}
                    placeholder="اختر أو أضف كلمات مفتاحية..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting || !pdfFile}
                  >
                    {isSubmitting ? "جاري الحفظ..." : "حفظ ونشر الكتاب"}
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

export default AddBook;
