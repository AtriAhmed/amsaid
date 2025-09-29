import About from "@/components/about/About";
import Books from "@/components/books/Books";
import Hero from "@/components/home/Hero";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Videos from "@/components/videos/Videos";
import { prisma } from "@/lib/prisma";

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

async function getVideos(): Promise<Video[]> {
  try {
    const videos = await prisma.video.findMany({
      take: 3,
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
            address: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return videos.map((video) => ({
      ...video,
      speakers: video.speakers.map((vs) => vs.person),
      tags: video.tags.map((vt) => vt.tag),
    }));
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
}

export default async function Home() {
  const videos = await getVideos();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Videos videos={videos} />
      <Books />
      <About />
      <Footer />
    </div>
  );
}
