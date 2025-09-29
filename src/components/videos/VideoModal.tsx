"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getMediaUrl } from "@/lib/utils";
import { ReactNode, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface Video {
  id: number;
  title: string;
  description: string;
  duration: number;
  poster: string | null;
  url: string;
  createdAt: Date;
  speakers: Array<{
    id: number;
    name: string;
  }>;
  category: {
    id: number;
    name: string;
  };
  place: {
    id: number;
    name: string;
    address: string | null;
  } | null;
  tags: Array<{
    id: number;
    name: string;
  }>;
}

interface VideoModalProps {
  video: Video;
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const VideoModal = ({
  video,
  children,
  isOpen,
  onOpenChange,
}: VideoModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      // Auto-play when modal opens
      videoRef.current.play().catch(console.error);
    } else if (!isOpen && videoRef.current) {
      // Pause when modal closes
      videoRef.current.pause();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">مشاهدة الفيديو</DialogTitle>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="!max-w-[90vw] !w-[90vw] h-[90vh] max-h-[90vh] p-0 bg-black overflow-hidden"
        overlayClassName="bg-black/90"
        showCloseButton={false}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-10 bg-slate-600/50 hover:bg-slate-400/50 text-white rounded-full p-2 transition-colors duration-200 backdrop-blur-sm"
            aria-label="إغلاق الفيديو"
          >
            <X size={20} />
          </button>
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            preload="metadata"
            poster={getMediaUrl(video.poster) || undefined}
            aria-label={video.title}
            autoPlay
          >
            <source src={getMediaUrl(video.url)} />
            متصفحك لا يدعم تشغيل الفيديو.
            <a href={getMediaUrl(video.url)} download>
              تحميل الفيديو
            </a>
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
