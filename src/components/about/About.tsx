import { Card, CardContent } from "@/components/ui/card";
import { formatCount } from "@/lib/formatCount";
import { StatsObject } from "@/types";
import { Heart, Users, BookOpen, Award, VideoIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function About({ stats: statsObject }: { stats: StatsObject }) {
  const t = useTranslations("common");
  const stats = [
    {
      icon: Users,
      number: formatCount(statsObject.visits || 0),
      label: t("visitors"),
    },
    {
      icon: BookOpen,
      number: formatCount(statsObject.totalBooks || 0),
      label: t("islamic book"),
    },
    {
      icon: VideoIcon,
      number: formatCount(statsObject.totalVideos || 0),
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
      <div className="mx-auto px-4 container">
        <div className="items-center gap-16 grid grid-cols-1 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 font-bold text-foreground text-4xl md:text-5xl">
              {t("about us")}
            </h2>
            <p className="mb-6 text-muted-foreground text-lg leading-relaxed">
              {t("about description 1")}
            </p>
            <p className="mb-8 text-muted-foreground text-lg leading-relaxed">
              {t("about description 2")}
            </p>

            <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="p-4 hover:shadow-elegant text-center transition-smooth"
                >
                  <CardContent className="p-0">
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="mb-1 font-bold text-foreground text-2xl">
                      {stat.number}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="p-8 rounded-2xl bg-gradient-hero shadow-elegant text-center">
              <h3 className="mb-4 font-bold text-primary-foreground text-2xl">
                {t("our mission")}
              </h3>
              <p className="mb-6 text-primary-foreground/90 leading-relaxed">
                {t("mission description")}
              </p>

              <h3 className="mb-4 font-bold text-primary-foreground text-2xl">
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
}
