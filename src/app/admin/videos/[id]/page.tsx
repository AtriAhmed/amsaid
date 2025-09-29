import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VideoForm from "@/components/admin/videos/VideoForm";

interface Video {
  id: number;
  title: string;
  description: string;
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
  } | null;
  language: string;
  poster: string | null;
  url: string;
  date: string;
  tags: Array<{
    id: number;
    name: string;
  }>;
}

interface EditVideoProps {
  params: Promise<{ id: string }>;
}

async function getVideo(id: string): Promise<Video | null> {
  const videoId = parseInt(id, 10);

  if (isNaN(videoId) || videoId < 1) {
    return null;
  }

  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        speakers: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
              },
            },
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
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!video) {
      return null;
    }

    return {
      ...video,
      date: video.date.toISOString(),
      speakers: video.speakers.map((vs) => vs.person),
      tags: video.tags.map((vt) => vt.tag),
    };
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}

export default async function EditVideo({ params }: EditVideoProps) {
  const { id } = await params;
  const video = await getVideo(id);

  if (!video) {
    notFound();
  }

  return <VideoForm initialVideo={video} />;
}
