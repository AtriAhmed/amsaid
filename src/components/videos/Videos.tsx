"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Clock } from "lucide-react";
import { getMediaUrl } from "@/lib/utils";
import Image from "next/image";
import VideoModal from "./VideoModal";
import { useState } from "react";

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

interface VideosProps {
  videos: Video[];
}

// Helper function to format duration from seconds to MM:SS
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const Videos = ({ videos }: VideosProps) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedVideo(null);
    }
  };

  return (
    <section id="videos" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            المحاضرات والخطب
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            مجموعة مختارة من المحاضرات الإسلامية التعليمية والتربوية
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              لا توجد محاضرات متاحة
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <VideoModal
                key={video.id}
                video={video}
                isOpen={isModalOpen && selectedVideo?.id === video.id}
                onOpenChange={handleModalClose}
              >
                <Card className="group hover:shadow-elegant hover:bg-muted hover:scale-[1.02] transition-smooth overflow-hidden duration-200">
                  <div
                    className="relative h-48 overflow-hidden cursor-pointer"
                    onClick={() => handleVideoClick(video)}
                  >
                    <Image
                      src={getMediaUrl(video.poster)}
                      fill
                      alt={video.title}
                      className="object-cover group-hover:scale-105 transition-smooth duration-100"
                    />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                      <Button variant="hero" size="lg">
                        <Play className="mr-2 h-6 w-6" />
                        شاهد الآن
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-sm flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-muted-foreground text-sm">
                        <span>
                          {video.speakers.map((s) => s.name).join(", ")}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        معلومات أكثر
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </VideoModal>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="default" size="lg">
            عرض جميع المحاضرات
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Videos;
