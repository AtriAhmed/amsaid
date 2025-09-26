import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Clock, Eye } from "lucide-react";

const Videos = () => {
  const videos = [
    {
      id: 1,
      title: "التوبة النصوح والعودة إلى الله",
      description: "محاضرة مؤثرة عن أهمية التوبة النصوح والعودة إلى الله عز وجل",
      duration: "45:30",
      views: "12,500",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop&crop=faces"
    },
    {
      id: 2,
      title: "أخلاق المسلم في التعامل",
      description: "كيف يتعامل المسلم مع الآخرين بأخلاق الإسلام السمحة",
      duration: "38:15",
      views: "9,800",
      thumbnail: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&h=225&fit=crop&crop=faces"
    },
    {
      id: 3,
      title: "الصبر والثبات على دين الله",
      description: "محاضرة عن فضائل الصبر وأهميته في حياة المسلم",
      duration: "52:20",
      views: "15,200",
      thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop&crop=faces"
    }
  ];

  return (
    <section id="videos" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            المحاضرات والخطب
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            مجموعة مختارة من المحاضرات الإسلامية التعليمية والتربوية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <Card key={video.id} className="group hover:shadow-elegant transition-smooth overflow-hidden">
              <div className="relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                  <Button variant="hero" size="lg">
                    <Play className="mr-2 h-6 w-6" />
                    شاهد الآن
                  </Button>
                </div>
                <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-sm flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {video.duration}
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {video.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Eye className="mr-1 h-4 w-4" />
                    {video.views} مشاهدة
                  </div>
                  <Button variant="outline" size="sm">
                    شاهد المزيد
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="default" size="lg">
            عرض جميع المحاضرات
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Videos;