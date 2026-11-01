import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import VisitTracker from "./components/VisitTracker";
import SignInGate from "./components/SignInGate";
import ReferralHandler from "./components/ReferralHandler";
import InstallAppButton from "./components/InstallAppButton";
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
        <AuthProvider>
          <ReferralHandler />
          <InstallAppButton />
          {session ? (
            <>
              <VisitTracker />
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