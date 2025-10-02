"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import SpeakersCombobox from "@/components/admin/videos/SpeakersCombobox";
import PlaceCombobox from "@/components/admin/videos/PlaceCombobox";
import TagsCombobox from "@/components/admin/books/TagsCombobox";
import FileDropzone from "@/components/admin/books/FileDropzone";
import VideoCategorySelect from "@/components/admin/videos/VideoCategorySelect";
import LanguageSelect from "@/components/admin/books/LanguageSelect";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Video } from "@/types";

// Validation schema including file fields
const videoSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان الفيديو مطلوب")
    .max(200, "يجب أن يكون العنوان أقل من 200 حرف"),
  description: z.string().optional(),
  speakers: z
    .array(z.union([z.number(), z.string()]))
    .min(1, "متحدث واحد على الأقل مطلوب"),
  categoryId: z.number().min(1, "فئة الفيديو مطلوبة"),
  language: z.string().min(1, "اللغة مطلوبة"),
  place: z
    .union([z.number(), z.string()])
    .refine((val) => val !== null && val !== "", { message: "المكان مطلوب" }),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), "تاريخ غير صحيح"),
  tags: z.array(z.union([z.number(), z.string()])).optional(),
  active: z.boolean().optional(),
  poster: z
    .union([z.string(), z.instanceof(File)])
    .optional()
    .refine((val) => val !== undefined, { message: "الصورة المصغرة مطلوبة" }),
  videoFile: z
    .union([z.string(), z.instanceof(File)])
    .optional()
    .refine((val) => val !== undefined, {
      message: "ملف الفيديو مطلوب",
    }),
});

type VideoFormData = z.infer<typeof videoSchema>;

interface VideoFormProps {
  initialVideo?: Video;
}

const VideoForm = ({ initialVideo }: VideoFormProps) => {
  const router = useRouter();
  const mode = initialVideo ? "edit" : "create";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: initialVideo?.title || "",
      description: initialVideo?.description || "",
      speakers: initialVideo?.speakers?.map((speaker) => speaker.id) || [],
      categoryId: initialVideo?.category?.id || 0,
      language: initialVideo?.language || "",
      place: initialVideo?.place?.id || "",
      date: initialVideo?.date
        ? new Date(initialVideo.date).toISOString().split("T")[0]
        : "",
      tags: initialVideo?.tags?.map((tag) => tag.id) || [],
      poster: initialVideo?.poster || undefined,
      videoFile: initialVideo?.url || undefined,
      active: initialVideo?.active !== undefined ? initialVideo.active : true,
    },
  });

  const data = watch();

  // Populate form with initial video data
  useEffect(() => {
    if (mode === "edit" && initialVideo) {
      // Reset form with existing data
      reset({
        title: initialVideo.title,
        description: initialVideo.description,
        speakers: initialVideo.speakers?.map((speaker) => speaker.id) || [],
        categoryId: initialVideo.category?.id,
        language: initialVideo.language,
        place: initialVideo.place?.id || "",
        date: new Date(initialVideo.date).toISOString().split("T")[0],
        tags: initialVideo.tags?.map((tag) => tag.id),
        poster: initialVideo.poster || undefined,
        videoFile: initialVideo.url || undefined,
        active: initialVideo.active !== undefined ? initialVideo.active : true,
      });
    }
  }, [initialVideo, mode, reset]);

  // Enhanced schema validation that includes file requirements
  const createModeSchema = videoSchema.extend({
    videoFile: z
      .union([z.string(), z.instanceof(File)])
      .refine((val) => val !== undefined, { message: "ملف الفيديو مطلوب" }),
  });

  // Helper: calculate duration (in seconds) for a File video
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      try {
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        // Load only metadata to get duration faster
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          // Safari sometimes reports Infinity for streams; handle defensively
          const duration = isFinite(video.duration) ? video.duration : 0;
          URL.revokeObjectURL(url);
          resolve(duration);
        };
        video.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(new Error("Unable to load video metadata"));
        };
        video.src = url;
      } catch (err) {
        reject(err);
      }
    });
  };

  const onSubmit = async (data: VideoFormData) => {
    // Additional validation for create mode
    if (mode === "create") {
      const result = createModeSchema.safeParse(data);
      if (!result.success) {
        // Handle validation errors
        result.error.issues.forEach((issue) => {
          if (issue.path[0] === "videoFile") {
            // Trigger validation to show error
            setValue("videoFile", data.videoFile, {
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
      formData.append("description", data.description || "");
      formData.append("speakers", JSON.stringify(data.speakers || []));
      formData.append("categoryId", data.categoryId?.toString() || "");
      formData.append("language", data.language);
      formData.append(
        "place",
        typeof data.place === "number"
          ? data.place.toString()
          : data.place?.toString() || ""
      );
      formData.append("date", data.date);
      formData.append("tags", JSON.stringify(data.tags || []));
      formData.append(
        "active",
        (data.active !== undefined ? data.active : true).toString()
      );

      // Add files only if provided and they are File objects (new uploads)
      if (data.poster && data.poster instanceof File) {
        formData.append("poster", data.poster);
      }

      // If videoFile is a File, calculate its duration and append it
      if (data.videoFile && data.videoFile instanceof File) {
        // Append the file itself
        formData.append("videoFile", data.videoFile);

        try {
          const duration = await getVideoDuration(data.videoFile);
          // Append duration in seconds (floating string). Backend can round if needed.
          formData.append("duration", duration.toString());
          console.log("Video duration (s):", duration);
        } catch (err) {
          // If duration calculation fails, we continue but log the error.
          console.warn("Failed to calculate video duration:", err);
          // Optionally append 0 or skip. Here we skip appending duration.
        }
      }

      if (mode === "create") {
        await axios.post("/api/videos", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.put(`/api/videos/${initialVideo!.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Success - redirect to videos list
      router.push("/admin/videos");
    } catch (error: any) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} video:`,
        error
      );
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePosterDrop = (files: File[]) => {
    if (files.length > 0) {
      setValue("poster", files[0], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleVideoFileDrop = (files: File[]) => {
    if (files.length > 0) {
      setValue("videoFile", files[0], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleRemovePoster = () => {
    setValue("poster", undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleRemoveVideoFile = () => {
    setValue("videoFile", undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/videos">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للفيديوهات
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {mode === "create" ? "إضافة فيديو جديد" : "تعديل الفيديو"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "create"
                ? "أضف فيديواً جديداً إلى المكتبة"
                : "تعديل معلومات الفيديو المحدد"}
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>معلومات الفيديو</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="active" className="text-sm font-normal">
                    منشور
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
                املأ جميع الحقول المطلوبة{" "}
                {mode === "create" ? "لإضافة" : "لتعديل"} الفيديو
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان الفيديو *</Label>
                    <Input
                      id="title"
                      placeholder="مثال: خطبة الجمعة - أهمية الصلاة"
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
                    <Label htmlFor="speakers">المتحدثين *</Label>
                    <SpeakersCombobox
                      value={data.speakers || []}
                      onChange={(value) => {
                        setValue("speakers", value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      placeholder="اختر أو أضف متحدثين..."
                      disabled={isSubmitting}
                      ref={register("speakers")?.ref}
                    />
                    {errors.speakers && (
                      <p className="text-sm text-destructive">
                        {errors.speakers.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف الفيديو</Label>
                  <Textarea
                    id="description"
                    placeholder="وصف مختصر عن محتوى الفيديو..."
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
                    <Label htmlFor="category">الفئة *</Label>
                    <VideoCategorySelect
                      value={data.categoryId}
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
                    <Label htmlFor="language">اللغة *</Label>
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
                    ref={register("poster")?.ref}
                    className="sr-only translate-y-[100px]"
                  ></div>
                  <Label>صورة مصغرة *</Label>
                  <FileDropzone
                    onDrop={handlePosterDrop}
                    accept={{
                      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
                    }}
                    maxSize={20 * 1024 * 1024} // 20MB
                    value={data.poster}
                    onRemove={handleRemovePoster}
                    placeholder="اسحب وأفلت الصورة المصغرة هنا أو انقر للاختيار"
                    disabled={isSubmitting}
                  />
                  {errors.poster && (
                    <p className="text-sm text-destructive">
                      {errors.poster.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div
                    tabIndex={-1}
                    ref={register("videoFile")?.ref}
                    className="sr-only translate-y-[100px]"
                  ></div>
                  <Label>ملف الفيديو *</Label>
                  <FileDropzone
                    onDrop={handleVideoFileDrop}
                    accept={{
                      "video/*": [".mp4", ".avi", ".mov", ".mkv", ".webm"],
                    }}
                    maxSize={500 * 1024 * 1024} // 500MB
                    value={data.videoFile}
                    onRemove={handleRemoveVideoFile}
                    placeholder="اسحب وأفلت ملف الفيديو هنا أو انقر للاختيار"
                    disabled={isSubmitting}
                  />
                  {errors.videoFile && (
                    <p className="text-sm text-destructive">
                      {errors.videoFile.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">تاريخ التسجيل *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !watch("date") && "text-muted-foreground"
                          )}
                          ref={register("date")?.ref}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watch("date") ? (
                            new Date(watch("date")).toLocaleDateString(
                              "en-UK",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }
                            )
                          ) : (
                            <span>اختر التاريخ</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            watch("date") ? new Date(watch("date")) : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              setValue("date", date.toISOString(), {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }
                          }}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.date && (
                      <p className="text-sm text-destructive">
                        {errors.date.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="place">مكان التسجيل *</Label>
                    <PlaceCombobox
                      value={data.place}
                      onChange={(value) => {
                        setValue("place", value || "", {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      placeholder="اختر أو أضف مكان..."
                      disabled={isSubmitting}
                      ref={register("place")?.ref}
                    />
                    {errors.place && (
                      <p className="text-sm text-destructive">
                        {errors.place.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>الكلمات المفتاحية</Label>
                  <TagsCombobox
                    value={data.tags || []}
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
                    disabled={isSubmitting || (mode === "edit" && !isDirty)}
                  >
                    {isSubmitting
                      ? "جاري الحفظ..."
                      : mode === "create"
                      ? "حفظ ونشر الفيديو"
                      : isDirty
                      ? "حفظ التعديلات"
                      : "لا توجد تغييرات"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={() => router.push("/admin/videos")}
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

export default VideoForm;
