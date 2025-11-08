"use client";

import { Button } from "@/components/ui/button";
import { Video as VideoIcon } from "lucide-react";
import VideoModal from "./VideoModal";
import { useState } from "react";
import ViewVideoDialog from "@/components/videos/ViewVideoDialog";
import VideoCard from "./VideoCard";
import { Video } from "@/types";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface VideosProps {
  videos: Video[];
}

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
          <div className="text-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-muted p-6">
                <VideoIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("no lectures available")}
                </h3>
                <p className="text-muted-foreground">
                  {t("check_back_later")}
                </p>
              </div>
            </div>
          </div>
        ) : (
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
        )}

        <div className="text-center mt-12">
          <Button asChild variant="default" size="lg">
            <Link href="/videos">{t("view all lectures")}</Link>
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
