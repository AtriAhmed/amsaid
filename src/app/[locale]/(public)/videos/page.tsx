import VideosPage from "@/components/videos/VideosPage";
import BooksPage from "@/components/books/BooksPage";
import { prisma } from "@/lib/prisma";

async function getBooks() {
  try {
    const books = await prisma.book.findMany({
      where: {
        active: true,
      },
      take: 20,
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

    return {
      books,
      pagination: {
        page: 0,
        limit: 0,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  } catch (error) {
    console.error("Error fetching books:", error);
    return {
      books: [],
      pagination: {
        page: 0,
        limit: 0,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

async function getVideos() {
  try {
    const videos = await prisma.video.findMany({
      where: {
        active: true,
      },
      take: 20,
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

    return {
      videos,
      pagination: {
        page: 0,
        limit: 0,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  } catch (error) {
    console.error("Error fetching videos:", error);
    return {
      videos: [],
      pagination: {
        page: 0,
        limit: 0,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

export default async function page() {
  const videos = await getVideos();

  return (
    <div>
      <VideosPage initialVideos={videos} />
    </div>
  );
}
