import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

// Shu email bilan kirgan odam avtomatik admin bo'ladi (Vercel'da ADMIN_EMAIL o'zgaruvchisi orqali sozlanadi)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase().trim();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as { role?: string }).role ?? "user";
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id) return;
      const isAdmin = !!ADMIN_EMAIL && user.email?.toLowerCase().trim() === ADMIN_EMAIL;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastSeenAt: new Date(),
          ...(isAdmin ? { role: "admin" } : {}),
        },
      });
    },
  },
});
