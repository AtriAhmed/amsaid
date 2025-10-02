import VideoForm from "@/components/admin/videos/VideoForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SWRConfig } from "swr";

interface EditVideoProps {
  params: Promise<{ id: string }>;
}

async function getVideo(id: string) {
  const videoId = parseInt(id, 10);

  if (isNaN(videoId) || videoId < 1) {
    return null;
  }

  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        speakers: {
          select: {
            id: true,
            name: true,
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
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!video) {
      return null;
    }

    return video;
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}

async function getAuthors() {
  try {
    const authors = await prisma.person.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });
    return authors;
  } catch (error) {
    console.error("Error fetching authors:", error);
    return [];
  }
}

async function getTags() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });
    return tags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

async function getVideoCategories() {
  try {
    const categories = await prisma.videoCategory.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });
    return { data: categories };
  } catch (error) {
    console.error("Error fetching book categories:", error);
    return [];
  }
}

async function getPlaces() {
  try {
    const places = await prisma.place.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });
    return places;
  } catch (error) {
    console.error("Error fetching book categories:", error);
    return [];
  }
}

export default async function EditVideo({ params }: EditVideoProps) {
  const { id } = await params;
  const video = await getVideo(id);
  const authors = await getAuthors();
  const tags = await getTags();
  const videoCategories = await getVideoCategories();
  const places = await getPlaces();

  if (!video) {
    notFound();
  }

  return (
    <SWRConfig value={{ fallback: { authors, tags, videoCategories, places } }}>
      <VideoForm initialVideo={video} />;
    </SWRConfig>
  );
}
