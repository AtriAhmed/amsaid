import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Play, Users, BarChart3, Download } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

const Dashboard = async () => {
  const stats = await getStats();
  return (
    <div className="min-h-screen-without-nav bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">لوحة التحكم الإدارية</h1>
          <p className="text-muted-foreground">
            إدارة المحتوى والكتب والفيديوهات
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي الكتب
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalBooks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">كتاب متاح للتحميل</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي الفيديوهات
              </CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalVideos.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                فيديو متاح للمشاهدة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                مشاهدات الفيديو
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.videoViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">إجمالي المشاهدات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                تحميلات الكتب
              </CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.bookDownloads.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">إجمالي التحميلات</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الكتب</CardTitle>
              <CardDescription>إضافة وتعديل وحذف الكتب المتاحة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/admin/books/add">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة كتاب جديد
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/books">عرض الكتب</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إدارة الفيديوهات</CardTitle>
              <CardDescription>
                إضافة وتعديل وحذف الفيديوهات المتاحة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/admin/videos/add">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة فيديو جديد
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/videos">عرض الفيديوهات</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
