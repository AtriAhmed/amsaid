// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = CredentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        // Minimal user object for JWT
        return { id: String(user.id), email: user.email, name: user.name ?? null };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.email = user.email;
        token.name = user.name ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        (session.user as any) = {
          id: token.id,
          email: token.email as string,
          name: (token.name as string) ?? null,
        };
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
};
