import NextAuth from "next-auth";
import type { OAuthConfig } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import { ensureReferralCode } from "./lib/gamification";

// Shu email bilan kirgan odam avtomatik admin bo'ladi (Vercel'da ADMIN_EMAIL o'zgaruvchisi orqali sozlanadi)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase().trim();

type GoogleProfile = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
};

// OIDC discovery/"iss" tekshiruvisiz, oddiy OAuth 2.0 rejimida —
// next-auth@5 beta'dagi Google OIDC provayderida "iss" xatosi borligi uchun
const GoogleProvider: OAuthConfig<GoogleProfile> = {
  id: "google",
  name: "Google",
  type: "oauth",
  // Google authorization code bilan birga "iss" so'rov parametrini ham
  // qo'shadi (RFC 9207); next-auth buni shu qiymat bilan solishtiradi
  issuer: "https://accounts.google.com",
  authorization: {
    url: "https://accounts.google.com/o/oauth2/v2/auth",
    // "openid" yo'q — shunda Google id_token qaytarmaydi va next-auth
    // OIDC/"iss" tekshiruviga umuman o'tmaydi, faqat userinfo chaqiradi
    params: { scope: "email profile" },
  },
  token: "https://oauth2.googleapis.com/token",
  userinfo: "https://www.googleapis.com/oauth2/v3/userinfo",
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  checks: ["pkce", "state"],
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [GoogleProvider],
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
      await ensureReferralCode(user.id);
    },
  },
});
