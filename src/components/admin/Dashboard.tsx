import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Play, BarChart3, Download } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface Stats {
  videoViews: number;
  totalVideos: number;
  bookDownloads: number;
  totalBooks: number;
}

interface DashboardClientProps {
  stats: Stats;
}

export default function Dashboard({ stats }: DashboardClientProps) {
  const t = useTranslations("common");

  return (
    <div className="min-h-screen-without-nav bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("admin dashboard")}</h1>
          <p className="text-muted-foreground">
            {t("manage content and books and videos")}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-2 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("total books")}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalBooks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("book available for download")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("total videos")}
              </CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalVideos.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("video available for viewing")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("video views")}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.videoViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("total views")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("book downloads")}
              </CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.bookDownloads.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("total downloads")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("book management")}</CardTitle>
              <CardDescription>
                {t("add edit delete available books")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/admin/books/add">
                    <Plus className="w-4 h-4 ml-2" />
                    {t("add new book")}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/books">{t("view books")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("video management")}</CardTitle>
              <CardDescription>
                {t("add edit delete available videos")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/admin/videos/add">
                    <Plus className="w-4 h-4 ml-2" />
                    {t("add new video")}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/videos">{t("view videos")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
