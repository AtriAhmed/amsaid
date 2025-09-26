import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, BookOpen, Award } from "lucide-react";

const About = () => {
  const stats = [
    {
      icon: Users,
      number: "50,000+",
      label: "متابع"
    },
    {
      icon: BookOpen,
      number: "200+",
      label: "كتاب إسلامي"
    },
    {
      icon: Heart,
      number: "1,000+",
      label: "محاضرة"
    },
    {
      icon: Award,
      number: "15+",
      label: "عام خبرة"
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              من نحن
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              نحن منصة إسلامية تعليمية تهدف إلى نشر العلم الشرعي والمعرفة الإسلامية من خلال
              المحاضرات المرئية والكتب الإسلامية القيمة. نسعى لتقديم محتوى إسلامي أصيل
              يساعد المسلمين على فهم دينهم بشكل صحيح.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              منذ تأسيسنا، نؤمن بأن العلم الشرعي حق للجميع، لذا نقدم جميع محتوياتنا
              مجاناً لوجه الله تعالى. هدفنا هو إيصال الدعوة الإسلامية بأسلوب معاصر
              وواضح يناسب جميع الأعمار والثقافات.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-4 hover:shadow-elegant transition-smooth">
                  <CardContent className="p-0">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-hero rounded-2xl p-8 text-center shadow-elegant">
              <h3 className="text-2xl font-bold text-primary-foreground mb-4">
                رسالتنا
              </h3>
              <p className="text-primary-foreground/90 leading-relaxed mb-6">
                نشر العلم الشرعي الصحيح وتبسيطه للمسلمين في جميع أنحاء العالم،
                والمساهمة في بناء جيل واعٍ بأحكام الدين وآدابه.
              </p>
              
              <h3 className="text-2xl font-bold text-primary-foreground mb-4">
                رؤيتنا
              </h3>
              <p className="text-primary-foreground/90 leading-relaxed">
                أن نكون المرجع الأول للمحتوى الإسلامي التعليمي عبر الإنترنت،
                ونساهم في إحياء روح طلب العلم في الأمة الإسلامية.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;