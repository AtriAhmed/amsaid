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
import { ArrowRight, Upload, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

const AddVideo = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/videos">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للفيديوهات
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">إضافة فيديو جديد</h1>
            <p className="text-muted-foreground">
              أضف فيديو جديداً إلى المكتبة
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الفيديو</CardTitle>
              <CardDescription>
                املأ جميع الحقول المطلوبة لإضافة الفيديو
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الفيديو *</Label>
                <Input
                  id="title"
                  placeholder="مثال: خطبة الجمعة - أهمية الصلاة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف الفيديو</Label>
                <Textarea
                  id="description"
                  placeholder="وصف مختصر عن محتوى الفيديو..."
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
                      <SelectItem value="khutab">خطب</SelectItem>
                      <SelectItem value="durus">دروس</SelectItem>
                      <SelectItem value="sharh">شروحات</SelectItem>
                      <SelectItem value="maw3eza">مواعظ</SelectItem>
                      <SelectItem value="quraan">قرآن</SelectItem>
                      <SelectItem value="hadith">حديث</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">صورة مصغرة (اختيارية)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    اسحب وأفلت الصورة المصغرة هنا
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    أو سيتم استخدام الصورة المصغرة من اليوتيوب
                  </p>
                  <Button variant="outline" size="sm">
                    اختر ملف
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speaker">المتحدث</Label>
                  <Input id="speaker" placeholder="مثال: الشيخ محمد أحمد" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">تاريخ التسجيل</Label>
                  <Input id="date" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">مكان التسجيل</Label>
                <Input id="location" placeholder="مثال: المسجد النبوي" />
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

              <div className="space-y-2">
                <Label htmlFor="tags">الكلمات المفتاحية</Label>
                <Input
                  id="tags"
                  placeholder="مثال: خطبة، جمعة، صلاة (مفصولة بفواصل)"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button className="flex-1">حفظ ونشر الفيديو</Button>
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

export default AddVideo;
