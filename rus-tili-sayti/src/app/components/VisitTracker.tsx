"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Har bir sahifaga o'tilganda /api/track'ga jo'natadi (qurilma turi serverda aniqlanadi)
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      // Internet yo'qligi yoki boshqa sabab — e'tiborsiz qoldiramiz
    });
  }, [pathname]);

  return null;
}
