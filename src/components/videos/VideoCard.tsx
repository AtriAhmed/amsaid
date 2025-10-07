"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Clock } from "lucide-react";
import { getMediaUrl } from "@/lib/utils";
import Image from "next/image";
import { Video } from "@/types";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface VideoCardProps {
  video: Video;
  onVideoClick: (video: Video) => void;
  onMoreInfo: (video: Video) => void;
}

// Helper function to format duration from seconds to HH:MM:SS
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const VideoCard = ({ video, onVideoClick, onMoreInfo }: VideoCardProps) => {
  const t = useTranslations("common");

  return (
    <Card className="flex flex-col group hover:shadow-elegant hover:shadow-lg hover:scale-[1.02] transition-smooth overflow-hidden duration-200">
      <Link
        className="relative h-60 overflow-hidden cursor-pointer"
        href={`/videos/${video.id}`}
      >
        <Image
          src={getMediaUrl(video.poster)}
          fill
          alt={video.title}
          className="object-cover group-hover:scale-105 transition-smooth duration-100 blur-md"
        />
        <Image
          src={getMediaUrl(video.poster)}
          fill
          alt={video.title}
          className="object-contain group-hover:scale-105 transition-smooth duration-100"
        />
        <div className="absolute inset-0 bg-primary/20 hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center duration-200">
          <Button variant="hero" size="lg">
            <Play className="mr-2 h-6 w-6" />
            {t("watch now")}
          </Button>
        </div>
        <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
          {t("video")}
        </div>
        {video.category && (
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            {video.category.name}
          </div>
        )}
      </Link>

      <CardContent className="grow flex flex-col px-6 pt-2 pb-4">
        <h3 className="text-xl font-semibold text-foreground mb-1">
          {video.title}
        </h3>
        <p className="text-primary font-medium">
          {video.speakers?.map((s) => s.name).join(", ")}
        </p>
        <p className="text-muted-foreground mb-2 line-clamp-2">
          {video.description}
        </p>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 mt-auto">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {formatDuration(video.duration)}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="default" size="sm" className="flex-1 py-1.5" asChild>
            <Link href={`/videos/${video.id}`}>
              <Play className="mr-2 h-4 w-4" />
              {t("watch now")}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 py-1.5"
            onClick={() => onMoreInfo(video)}
          >
            {t("more info")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
