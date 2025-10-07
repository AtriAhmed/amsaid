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
import { useTranslations } from "next-intl";
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
import UploadProgressIndicator, {
  UploadStatus,
  UploadFileType,
} from "@/components/ui/UploadProgressIndicator";
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
    .min(1, "video title required")
    .max(200, "video title max length"),
  description: z.string().optional(),
  speakers: z
    .array(z.union([z.number(), z.string()]))
    .min(1, "at least one speaker required"),
  categoryId: z.number().min(1, "video category required"),
  language: z.string().min(1, "language required"),
  place: z
    .union([z.number(), z.string()])
    .refine((val) => val !== null && val !== "", { message: "place required" }),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), "invalid date"),
  tags: z.array(z.union([z.number(), z.string()])).optional(),
  active: z.boolean().optional(),
  poster: z
    .union([z.string(), z.instanceof(File)])
    .optional()
    .refine((val) => val !== undefined, { message: "poster image required" }),
  videoFile: z
    .union([z.string(), z.instanceof(File)])
    .optional()
    .refine((val) => val !== undefined, {
      message: "video file required",
    }),
});

type VideoFormData = z.infer<typeof videoSchema>;

interface VideoFormProps {
  initialVideo?: Video;
}

const VideoForm = ({ initialVideo }: VideoFormProps) => {
  const t = useTranslations("common");
  const router = useRouter();
  const mode = initialVideo ? "edit" : "create";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({
    status: "idle" as UploadStatus,
    progress: 0,
    fileType: null as UploadFileType,
  });

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
      .refine((val) => val !== undefined, { message: "video file required" }),
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

    // Determine which files are being uploaded
    const hasNewPoster = data.poster && data.poster instanceof File;
    const hasNewVideo = data.videoFile && data.videoFile instanceof File;
    const hasFilesToUpload = hasNewPoster || hasNewVideo;

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

      // Only initialize upload state if there are files to upload
      if (hasFilesToUpload) {
        setUploadState({
          status: "uploading",
          progress: 0,
          fileType: hasNewPoster ? "poster" : "video",
        });
      }

      // Add files only if provided and they are File objects (new uploads)
      if (hasNewPoster) {
        formData.append("poster", data.poster as File);
      }

      // If videoFile is a File, calculate its duration and append it
      if (hasNewVideo) {
        const videoFile = data.videoFile as File;
        // Append the file itself
        formData.append("videoFile", videoFile);

        try {
          const duration = await getVideoDuration(videoFile);
          // Append duration in seconds (floating string). Backend can round if needed.
          formData.append("duration", duration.toString());
        } catch (err) {
          // If duration calculation fails, we continue but log the error.
          console.warn("Failed to calculate video duration:", err);
          // Optionally append 0 or skip. Here we skip appending duration.
        }
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
        await axios.post("/api/videos", formData, config);
      } else {
        await axios.put(`/api/videos/${initialVideo!.id}`, formData, config);
      }

      if (hasFilesToUpload) {
        setUploadState((prev) => ({ ...prev, status: "success" }));
      }

      // Small delay to show success state
      setTimeout(
        () => {
          router.push("/admin/videos");
        },
        hasFilesToUpload ? 1000 : 0
      );
    } catch (error: any) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} video:`,
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
              {t("view videos")}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {mode === "create" ? t("add video") : t("edit video")}
            </h1>
            <p className="text-muted-foreground">
              {mode === "create" ? t("add new video") : t("edit video")}
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {t("video")} {t("information")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="active" className="text-sm font-normal">
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
                {t("video")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t("video title")} *</Label>
                    <Input
                      id="title"
                      placeholder={t("video title placeholder")}
                      {...register("title")}
                      defaultValue={data.title}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">
                        {t(errors.title.message || "error")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="speakers">{t("speakers")} *</Label>
                    <SpeakersCombobox
                      value={data.speakers || []}
                      onChange={(value) => {
                        setValue("speakers", value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      placeholder={t("speakers placeholder")}
                      disabled={isSubmitting}
                      ref={register("speakers")?.ref}
                    />
                    {errors.speakers && (
                      <p className="text-sm text-destructive">
                        {t(errors.speakers.message || "error")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("video description")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("video description placeholder")}
                    rows={4}
                    {...register("description")}
                    defaultValue={data.description}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {t(errors.description.message || "error")}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">{t("category")} *</Label>
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
                        {t(errors.categoryId.message || "error")}
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
                        {t(errors.language.message || "error")}
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
                  <Label>{t("poster image")} *</Label>
                  <FileDropzone
                    onDrop={handlePosterDrop}
                    accept={{
                      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
                    }}
                    maxSize={20 * 1024 * 1024} // 20MB
                    value={data.poster}
                    onRemove={handleRemovePoster}
                    placeholder={t("poster placeholder")}
                    disabled={isSubmitting}
                  />
                  {errors.poster && (
                    <p className="text-sm text-destructive">
                      {t(errors.poster.message || "error")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div
                    tabIndex={-1}
                    ref={register("videoFile")?.ref}
                    className="sr-only translate-y-[100px]"
                  ></div>
                  <Label>{t("video file")} *</Label>
                  <FileDropzone
                    onDrop={handleVideoFileDrop}
                    accept={{
                      "video/*": [".mp4", ".avi", ".mov", ".mkv", ".webm"],
                    }}
                    maxSize={1024 * 1024 * 1024} // 500MB
                    value={data.videoFile}
                    onRemove={handleRemoveVideoFile}
                    placeholder={t("video file placeholder")}
                    disabled={isSubmitting}
                  />
                  {errors.videoFile && (
                    <p className="text-sm text-destructive">
                      {t(errors.videoFile.message || "error")}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">{t("video date")} *</Label>
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
                            <span>{t("pick date")}</span>
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
                        {t(errors.date.message || "error")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="place">{t("place")} *</Label>
                    <PlaceCombobox
                      value={data.place}
                      onChange={(value) => {
                        setValue("place", value || "", {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      placeholder={t("place placeholder")}
                      disabled={isSubmitting}
                      ref={register("place")?.ref}
                    />
                    {errors.place && (
                      <p className="text-sm text-destructive">
                        {t(errors.place.message || "error")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("tags")}</Label>
                  <TagsCombobox
                    value={data.tags || []}
                    onChange={(value) => {
                      setValue("tags", value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    placeholder={t("tags placeholder")}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Upload Progress Indicator - Only show if there are files being uploaded */}
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
                      ? t("uploading")
                      : mode === "create"
                      ? t("add new video")
                      : isDirty
                      ? t("update video")
                      : t("no changes")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                    onClick={() => router.push("/admin/videos")}
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

export default VideoForm;
