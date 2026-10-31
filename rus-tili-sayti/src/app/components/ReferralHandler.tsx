"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const KEY = "pendingReferral";

// ?ref=KOD bilan kelgan tashrifni eslab qoladi, keyin tizimga kirgandan so'ng
// bir martalik ravishda serverga yuboradi (do'stni taklif qilgan odamga ball beriladi)
export default function ReferralHandler() {
  const { status } = useSession();

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      try {
        localStorage.setItem(KEY, ref);
      } catch {
        // localStorage mavjud emas
      }
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let code: string | null = null;
    try {
      code = localStorage.getItem(KEY);
    } catch {
      return;
    }
    if (!code) return;

    fetch("/api/me/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).finally(() => {
      try {
        localStorage.removeItem(KEY);
      } catch {
        // e'tiborsiz qoldiramiz
      }
    });
  }, [status]);

  return null;
}
