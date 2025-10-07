"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import VideoModal from "../VideoModal";
import { Video } from "@/types";
import { useState } from "react";

interface WatchButtonProps {
  video: Video;
  className?: string;
  size?: "sm" | "lg" | "default";
  children?: React.ReactNode;
}

export default function WatchButton({
  video,
  className,
  size = "default",
  children,
}: WatchButtonProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const watchVideo = () => {
    setIsVideoModalOpen(true);
  };

  return (
    <>
      <Button onClick={watchVideo} className={className} size={size}>
        {children || (
          <>
            <Play className="h-4 w-4" />
          </>
        )}
      </Button>

      <VideoModal
        video={video}
        isOpen={isVideoModalOpen}
        onOpenChange={setIsVideoModalOpen}
      />
    </>
  );
}
