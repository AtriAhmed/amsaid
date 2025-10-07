"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Video as VideoIcon } from "lucide-react";
import VideoModal from "./VideoModal";
import { useState } from "react";
import ViewVideoDialog from "@/components/videos/ViewVideoDialog";
import VideoCard from "./VideoCard";
import { Video } from "@/types";
import { useTranslations } from "next-intl";

interface VideosGridProps {
  videos: Video[];
  isLoading?: boolean;
}

// Loading skeleton component
const VideoSkeleton = () => (
  <Card className="flex flex-col overflow-hidden">
    <Skeleton className="h-60 w-full" />
    <CardContent className="grow flex flex-col px-6 pt-2 pb-4">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-12 w-full mb-2" />
      <div className="flex items-center justify-between mb-4 mt-auto">
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </CardContent>
  </Card>
);

export default function VideosGrid({ videos, isLoading }: VideosGridProps) {
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

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-muted/20 rounded-full">
            <VideoIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {t("no videos found")}
        </h3>
        <p className="text-muted-foreground">
          {t("try adjusting your search or filters")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onVideoClick={handleVideoClick}
            onMoreInfo={(video) => setViewDialog({ open: true, video })}
          />
        ))}
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
    </>
  );
}
