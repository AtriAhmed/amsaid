"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Clock } from "lucide-react";
import { getMediaUrl } from "@/lib/utils";
import Image from "next/image";
import VideoModal from "./VideoModal";
import { useState } from "react";
import ViewVideoDialog from "@/components/videos/ViewVideoDialog";
import { Video } from "@/types";
import { useTranslations } from "next-intl";

interface VideosProps {
  videos: Video[];
}

// Helper function to format duration from seconds to MM:SS
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default function Videos({ videos }: VideosProps) {
  const t = useTranslations("common");
  const [watchDialog, setWatchDialog] = useState<{
    open: boolean;
    video: Video | null;
  }>({
    open: false,
    video: null,
  });
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    video: Video | null;
  }>({
    open: false,
    video: null,
  });

  const handleVideoClick = (video: Video) => {
    setWatchDialog({ open: true, video });
  };

  const handleModalClose = (open: boolean) => {
    setWatchDialog({ open, video: null });
  };

  return (
    <section id="videos" className="py-20 bg-gradient-subtle">
      <div className="mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("lectures and sermons")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("selected islamic lectures description")}
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {t("no lectures available")}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="flex flex-col group hover:shadow-elegant hover:shadow-lg hover:scale-[1.02] transition-smooth overflow-hidden duration-200"
              >
                <div
                  className="relative h-60 overflow-hidden cursor-pointer"
                  onClick={() => handleVideoClick(video)}
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
                </div>

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
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 py-1.5"
                      onClick={() => handleVideoClick(video)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {t("watch now")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 py-1.5"
                      onClick={() => setViewDialog({ open: true, video })}
                    >
                      {t("more info")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="default" size="lg">
            {t("view all lectures")}
          </Button>
        </div>
      </div>

      <VideoModal
        video={watchDialog.video}
        isOpen={watchDialog.open}
        onOpenChange={handleModalClose}
      />

      <ViewVideoDialog
        open={viewDialog.open}
        onOpenChange={(open: boolean) =>
          setViewDialog({ open, video: open ? viewDialog.video : null })
        }
        video={viewDialog.video}
        onWatchVideo={() => {
          setViewDialog({ open: false, video: null });
          setWatchDialog({ open: true, video: viewDialog.video });
        }}
      />
    </section>
  );
}
