import { prisma } from "@/lib/prisma";
import Dashboard from "@/components/admin/Dashboard";

interface Stats {
  videoViews: number;
  totalVideos: number;
  bookDownloads: number;
  totalBooks: number;
}

async function getStats(): Promise<Stats> {
  try {
    // Fetch all stats in parallel for better performance
    const [totalVideoViews, totalVideos, totalBookDownloads, totalBooks] =
      await Promise.all([
        // Sum of all video views
        prisma.video.aggregate({
          _sum: {
            views: true,
          },
          where: {
            active: true,
          },
        }),

        // Count of active videos
        prisma.video.count({
          where: {
            active: true,
          },
        }),

        // Sum of all book downloads
        prisma.book.aggregate({
          _sum: {
            downloads: true,
          },
          where: {
            active: true,
          },
        }),

        // Count of active books
        prisma.book.count({
          where: {
            active: true,
          },
        }),
      ]);

    return {
      videoViews: totalVideoViews._sum.views || 0,
      totalVideos,
      bookDownloads: totalBookDownloads._sum.downloads || 0,
      totalBooks,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      videoViews: 0,
      totalVideos: 0,
      bookDownloads: 0,
      totalBooks: 0,
    };
  }
}

export default async function page() {
  const stats = await getStats();
  return <Dashboard stats={stats} />;
}
