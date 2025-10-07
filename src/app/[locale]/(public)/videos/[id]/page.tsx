import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Video as VideoIcon,
  Calendar,
  User,
  Tag as TagIcon,
  Globe,
  FileText,
  Clock,
  Eye,
  MapPin,
} from "lucide-react";
import { Video } from "@/types";
import { getMediaUrl, getVideoMediaUrl } from "@/lib/utils";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import WatchButton from "../../../../../components/videos/[id]/WatchButton";
import { LANGUAGES, LANGUAGES_OBJ } from "@/lib/constants";
import { formatDuration } from "@/lib/date";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

// Server-side function to fetch video data
async function getVideo(id: string): Promise<Video | null> {
  try {
    const videoId = parseInt(id, 10);
    if (isNaN(videoId) || videoId < 1) {
      return null;
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        speakers: {
          select: {
            id: true,
            name: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        place: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return video;
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}

// Function to increment video views (page view)
async function incrementVideoViews(id: number) {
  try {
    await prisma.video.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error("Error incrementing video views:", error);
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideo(id);

  if (!video) {
    return {
      title: "Video Not Found",
    };
  }

  const speakersNames =
    video.speakers?.map((s) => s.name).join(", ") || "Unknown Speaker";

  return {
    title: `${video.title} - ${speakersNames}`,
    description: video.description,
    openGraph: {
      title: video.title,
      description: video.description,
      images: video.poster ? [getMediaUrl(video.poster)] : [],
    },
  };
}

export default async function VideoPage({ params }: PageProps) {
  const { id, locale } = await params;
  const video = await getVideo(id);
  const t = await getTranslations("common");

  if (!video) {
    notFound();
  }

  // Increment page views
  incrementVideoViews(video.id);

  const formatDate = (date?: Date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString(
      locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    }
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/videos" className="hover:text-foreground">
              {t("videos")}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-xs">
              {video.title}
            </span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Video Player */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <VideoIcon className="h-6 w-6 text-primary" />
                    {video.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-100 rounded-b-lg overflow-hidden">
                  <video
                    src={getVideoMediaUrl(video.id)}
                    poster={getMediaUrl(video.poster) || undefined}
                    className="w-full h-full object-contain"
                    controls
                    preload="metadata"
                    title={video.title}
                  >
                    Your browser does not support the video tag.
                    <a href={getVideoMediaUrl(video.id)} download>
                      Download the video
                    </a>
                  </video>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Video Information */}
          <div className="space-y-6">
            {/* Video Poster and Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Video Poster */}
                  {video.poster && (
                    <div className="flex justify-center">
                      <img
                        src={getMediaUrl(video.poster)}
                        alt={video.title}
                        className="w-full max-w-[200px] h-auto object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}

                  {/* Title and Speakers */}
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold leading-tight">
                      {video.title}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {video.speakers?.map((s) => s.name).join(", ") ||
                        "Unknown Speaker"}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-lg">{video.views}</div>
                      <div className="text-muted-foreground">{t("views")}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">
                        {formatDuration(video.duration)}
                      </div>
                      <div className="text-muted-foreground">
                        {t("duration")}
                      </div>
                    </div>
                  </div>

                  {/* Watch Button */}
                </div>
              </CardContent>
            </Card>

            {/* Video Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t("video information")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Speakers */}
                {video.speakers && video.speakers.length > 0 && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{t("speakers")}</div>
                      <div className="text-sm text-muted-foreground">
                        {video.speakers.map((speaker) => (
                          <div key={speaker.id} className="mt-1">
                            {speaker.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Category */}
                {video.category && (
                  <div className="flex items-center gap-3">
                    <VideoIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{t("category")}</div>
                      <Badge variant="secondary" className="mt-1">
                        {video.category.name}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Language */}
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{t("language")}</div>
                    <div className="text-sm text-muted-foreground">
                      {LANGUAGES_OBJ[video.language]?.label
                        ? t(LANGUAGES_OBJ[video.language]?.label)
                        : video.language}
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{t("duration")}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                </div>

                {/* Views */}
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{t("views")}</div>
                    <div className="text-sm text-muted-foreground">
                      {video.views.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Video Date */}
                {video.date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{t("video date")}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(video.date)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Place */}
                {video.place && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{t("place")}</div>
                      <div className="text-sm text-muted-foreground">
                        {video.place.name}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Date */}
                {video.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{t("date added")}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(video.createdAt)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {video.tags && video.tags.length > 0 && (
                  <div className="flex items-start gap-3">
                    <TagIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{t("tags")}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {video.tags.map((tag) => (
                          <Badge key={tag.id} variant="outline">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {video.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t("video description")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {video.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Speakers Bio */}
            {video.speakers?.some((s) => s.bio) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    About Speakers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {video.speakers
                    .filter((s) => s.bio)
                    .map((speaker) => (
                      <div
                        key={speaker.id}
                        className="border-l-2 border-primary/20 pl-4"
                      >
                        <div className="font-medium text-sm mb-2">
                          {speaker.name}
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {speaker.bio}
                        </p>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Place Address */}
            {video.place?.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Place Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {video.place.address}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
