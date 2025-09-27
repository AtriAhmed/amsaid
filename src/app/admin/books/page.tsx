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
import { Plus, Search, Edit, Trash2, Download, Eye } from "lucide-react";
import Link from "next/link";

const BooksManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with actual data
  const books = [
    {
      id: 1,
      title: "أحكام الصلاة",
      author: "الشيخ محمد أحمد",
      category: "فقه",
      status: "منشور",
      downloads: 245,
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      title: "تفسير القرآن الكريم",
      author: "الشيخ محمد أحمد",
      category: "تفسير",
      status: "مسودة",
      downloads: 0,
      createdAt: "2024-01-10",
    },
    {
      id: 3,
      title: "أسماء الله الحسنى",
      author: "الشيخ محمد أحمد",
      category: "عقيدة",
      status: "منشور",
      downloads: 189,
      createdAt: "2024-01-05",
    },
  ];

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">إدارة الكتب</h1>
            <p className="text-muted-foreground">
              إضافة وتعديل وحذف الكتب المتاحة
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/books/add">
              <Plus className="w-4 h-4 ml-2" />
              إضافة كتاب جديد
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
                  placeholder="البحث في الكتب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Books Table */}
        <Card>
          <CardHeader>
            <CardTitle>الكتب المتاحة ({filteredBooks.length})</CardTitle>
            <CardDescription>جميع الكتب المضافة في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التحميلات</TableHead>
                  <TableHead>تاريخ الإضافة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <div className="font-medium">{book.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {book.author}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{book.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          book.status === "منشور" ? "default" : "outline"
                        }
                      >
                        {book.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {book.downloads}
                      </div>
                    </TableCell>
                    <TableCell>{book.createdAt}</TableCell>
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

export default BooksManagement;
