"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode } from "react";

// Sessiya serverda allaqachon olingan — uni shu yerga uzatamiz, shunda brauzer
// har sahifa ochilganda /api/auth/session'ga qo'shimcha so'rov yubormaydi.
export default function AuthProvider({ children, session }: { children: ReactNode; session: Session | null }) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
}
