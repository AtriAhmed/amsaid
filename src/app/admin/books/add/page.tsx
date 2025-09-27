import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Upload } from "lucide-react";
import Link from "next/link";

const AddBook = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/books">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للكتب
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">إضافة كتاب جديد</h1>
            <p className="text-muted-foreground">
              أضف كتاباً جديداً إلى المكتبة
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الكتاب</CardTitle>
              <CardDescription>
                املأ جميع الحقول المطلوبة لإضافة الكتاب
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الكتاب *</Label>
                  <Input id="title" placeholder="مثال: أحكام الصلاة" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">المؤلف *</Label>
                  <Input id="author" placeholder="مثال: الشيخ محمد أحمد" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف الكتاب</Label>
                <Textarea
                  id="description"
                  placeholder="وصف مختصر عن محتوى الكتاب..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">الفئة *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fiqh">فقه</SelectItem>
                      <SelectItem value="tafsir">تفسير</SelectItem>
                      <SelectItem value="aqeedah">عقيدة</SelectItem>
                      <SelectItem value="hadith">حديث</SelectItem>
                      <SelectItem value="sirah">سيرة</SelectItem>
                      <SelectItem value="akhlaq">أخلاق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">اللغة</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر اللغة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">الإنجليزية</SelectItem>
                      <SelectItem value="fr">الفرنسية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">صورة الغلاف</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    اسحب وأفلت صورة الغلاف هنا
                  </p>
                  <Button variant="outline" size="sm">
                    اختر ملف
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdf">ملف PDF *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    اسحب وأفلت ملف PDF هنا
                  </p>
                  <Button variant="outline" size="sm">
                    اختر ملف PDF
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pages">عدد الصفحات</Label>
                  <Input id="pages" type="number" placeholder="مثال: 250" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">حجم الملف (MB)</Label>
                  <Input
                    id="size"
                    type="number"
                    step="0.1"
                    placeholder="مثال: 2.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">الكلمات المفتاحية</Label>
                <Input
                  id="tags"
                  placeholder="مثال: صلاة، فقه، أحكام (مفصولة بفواصل)"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button className="flex-1">حفظ ونشر الكتاب</Button>
                <Button variant="outline" className="flex-1">
                  حفظ كمسودة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddBook;
