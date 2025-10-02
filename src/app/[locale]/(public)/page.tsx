import About from "@/components/about/About";
import Books from "@/components/books/Books";
import Hero from "@/components/home/Hero";
import Videos from "@/components/videos/Videos";
import { prisma } from "@/lib/prisma";
import { Book, Video } from "@/types";

async function getVideos(): Promise<Video[]> {
  try {
    const videos = await prisma.video.findMany({
      where: {
        active: true,
      },
      take: 4,
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
            address: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return videos;
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
}

async function getBooks(): Promise<Book[]> {
  try {
    const books = await prisma.book.findMany({
      where: {
        active: true,
      },
      take: 4,
      include: {
        author: {
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
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return books;
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

export default async function Home() {
  const videos = await getVideos();
  const books = await getBooks();

  return (
    <div className="min-h-screen bg-background -mt-[60px]">
      <Hero />
      <Videos videos={videos} />
      <Books books={books} />
      <About />
    </div>
  );
}
