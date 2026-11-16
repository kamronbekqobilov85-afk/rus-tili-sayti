import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import VisitTracker from "./components/VisitTracker";
import FeedbackWidget from "./components/FeedbackWidget";
import ChallengeReminder from "./components/ChallengeReminder";
import WinnerPopup from "./components/WinnerPopup";
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
  metadataBase: new URL("https://rus-tili-sayti.vercel.app"),
  title: "Rus tili — o'ynab, bepul o'rganing",
  description:
    "Rus tilini noldan, o'zbek tilida o'rganing: qisqa darslar, reyting, har kungi sovg'alar va ruscha qo'shiqlar. Kuniga 10 daqiqa yetarli.",
  openGraph: {
    type: "website",
    siteName: "Rus tili",
    locale: "uz_UZ",
    url: "/",
    title: "Rus tili — o'ynab, bepul o'rganing",
    description:
      "Rus tilini noldan, o'zbek tilida o'rganing: qisqa darslar, reyting, har kungi sovg'alar va ruscha qo'shiqlar. Kuniga 10 daqiqa yetarli.",
  },
  twitter: { card: "summary_large_image" },
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
        <TelegramWebApp />
        <AuthProvider session={session}>
          <ReferralHandler />
          {session ? (
            <>
              <VisitTracker />
              <FeedbackWidget />
              <ChallengeReminder />
              <WinnerPopup />
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