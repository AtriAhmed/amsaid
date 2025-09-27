"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Play, Eye } from "lucide-react";
import Link from "next/link";

const VideosManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with actual data
  const videos = [
    {
      id: 1,
      title: "خطبة الجمعة - أهمية الصلاة",
      category: "خطب",
      duration: "45:20",
      status: "منشور",
      views: 1245,
      createdAt: "2024-01-15",
      thumbnail: "/placeholder.svg",
    },
    {
      id: 2,
      title: "درس في التفسير - سورة البقرة",
      category: "دروس",
      duration: "32:15",
      status: "مسودة",
      views: 0,
      createdAt: "2024-01-10",
      thumbnail: "/placeholder.svg",
    },
    {
      id: 3,
      title: "شرح الأربعين النووية",
      category: "شروحات",
      duration: "28:45",
      status: "منشور",
      views: 892,
      createdAt: "2024-01-05",
      thumbnail: "/placeholder.svg",
    },
  ];

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">إدارة الفيديوهات</h1>
            <p className="text-muted-foreground">
              إضافة وتعديل وحذف الفيديوهات المتاحة
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/videos/add">
              <Plus className="w-4 h-4 ml-2" />
              إضافة فيديو جديد
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>البحث والتصفية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الفيديوهات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Videos Table */}
        <Card>
          <CardHeader>
            <CardTitle>الفيديوهات المتاحة ({filteredVideos.length})</CardTitle>
            <CardDescription>جميع الفيديوهات المضافة في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الفيديو</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>المدة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>المشاهدات</TableHead>
                  <TableHead>تاريخ الإضافة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                          <Play className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{video.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {video.duration}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{video.category}</Badge>
                    </TableCell>
                    <TableCell>{video.duration}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          video.status === "منشور" ? "default" : "outline"
                        }
                      >
                        {video.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {video.views}
                      </div>
                    </TableCell>
                    <TableCell>{video.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideosManagement;
