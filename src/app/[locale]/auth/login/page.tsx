"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("common");

  async function onSubmit(e: any) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    const res = await signIn("credentials", {
      redirect: false, // manual redirect
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid credentials");
    }

    setIsLoading(false);
  }

  return (
    <main className="grid min-h-screen -mt-[60px] pt-[60px]">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url(/assets/hero-image.jpg)]">
        <div className="absolute inset-0 bg-gradient-hero opacity-85"></div>
      </div>
      <div className="flex items-center justify-center relative overflow-hidden">
        {/* Hero Background Image with Overlay */}

        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-foreground/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-primary-foreground/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-primary-glow/15 rounded-full blur-xl"></div>

        {/* Login Card with Enhanced Backdrop Blur */}
        <Card className="relative z-10 w-full max-w-md shadow-2xl border border-primary-foreground/10 bg-background/10 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-primary-foreground/90 rounded-full flex items-center justify-center shadow-glow backdrop-blur-sm">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-primary-foreground drop-shadow-sm">
                {t("welcome back") || "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-base mt-2 text-primary-foreground/80">
                {t("login description") || "Sign in to access your account"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-primary-foreground font-medium"
                >
                  <Mail className="w-4 h-4" />
                  {t("email") || "Email"}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("enter email") || "Enter your email"}
                  className="h-12 bg-primary-foreground/10 border-primary-foreground/20 focus:border-primary-foreground/50 focus:bg-primary-foreground/20 transition-all duration-300 text-primary-foreground placeholder:text-primary-foreground/60 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-primary-foreground font-medium"
                >
                  <Lock className="w-4 h-4" />
                  {t("password") || "Password"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("enter password") || "Enter your password"}
                    className="h-12 bg-primary-foreground/10 border-primary-foreground/20 focus:border-primary-foreground/50 focus:bg-primary-foreground/20 transition-all duration-300 pr-12 text-primary-foreground placeholder:text-primary-foreground/60 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive-foreground text-sm font-medium backdrop-blur-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="heroSecondary"
                size="lg"
                className="w-full h-12 text-base font-semibold shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {isLoading
                  ? t("signing in") || "Signing in..."
                  : t("sign in") || "Sign In"}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="text-sm">
                <Link
                  href="/auth/password-reset"
                  className="text-accent hover:text-accent/80 font-medium transition-colors underline underline-offset-2"
                >
                  {t("forgot password") || "Forgot your password?"}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
