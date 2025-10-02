import { Button } from "@/components/ui/button";
import { Play, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

const Hero = () => {
  const t = useTranslations("common");
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/assets/hero-image.jpg)` }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-85"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
          {t("welcome to our website")}
          <span className="block text-accent">{t("islamic preacher")}</span>
        </h1>

        <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          {t("islamic educational platform description")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="hero" size="lg" className="min-w-[200px]">
            <Play className="mr-2 h-5 w-5" />
            {t("watch lectures")}
          </Button>
          <Button variant="heroSecondary" size="lg" className="min-w-[200px]">
            <BookOpen className="mr-2 h-5 w-5" />
            {t("browse books")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
