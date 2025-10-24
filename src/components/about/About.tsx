import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, BookOpen, Award } from "lucide-react";
import { useTranslations } from "next-intl";

const About = () => {
  const t = useTranslations("common");
  const stats = [
    {
      icon: Users,
      number: "50,000+",
      label: t("followers"),
    },
    {
      icon: BookOpen,
      number: "200+",
      label: t("islamic book"),
    },
    {
      icon: Heart,
      number: "1,000+",
      label: t("lecture"),
    },
    // {
    //   icon: Award,
    //   number: "15+",
    //   label: t("years experience"),
    // },
  ];

  return (
    <section id="about" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t("about us")}
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {t("about description 1")}
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t("about description 2")}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="text-center p-4 hover:shadow-elegant transition-smooth"
                >
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
                {t("our mission")}
              </h3>
              <p className="text-primary-foreground/90 leading-relaxed mb-6">
                {t("mission description")}
              </p>

              <h3 className="text-2xl font-bold text-primary-foreground mb-4">
                {t("our vision")}
              </h3>
              <p className="text-primary-foreground/90 leading-relaxed">
                {t("vision description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
