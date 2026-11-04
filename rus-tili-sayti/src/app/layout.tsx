import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import VisitTracker from "./components/VisitTracker";
import FeedbackWidget from "./components/FeedbackWidget";
import ChallengeReminder from "./components/ChallengeReminder";
import SignInGate from "./components/SignInGate";
import ReferralHandler from "./components/ReferralHandler";
import TelegramWebApp from "./components/TelegramWebApp";
import { auth } from "../auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rus tilini bepul o'rganing — so'zlar, grammatika, video",
  description: "Rus tilini noldan o'rganing: 500dan ortiq so'z, grammatika mashqlari, testlar va ruscha qo'shiqlar bilan. Bepul va oson.",
  verification: {
    google: "dPnmDXi4Wv_2J6GQivJHKkOS4hWbSPP7qmkSe4Yrk4I",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Ilova faqat tizimga kirgan foydalanuvchilarga ochiq
  const session = await auth();

  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <TelegramWebApp />
        <AuthProvider>
          <ReferralHandler />
          {session ? (
            <>
              <VisitTracker />
              <FeedbackWidget />
              <ChallengeReminder />
              {children}
            </>
          ) : (
            <SignInGate />
          )}
        </AuthProvider>
      </body>
    </html>
  );
}