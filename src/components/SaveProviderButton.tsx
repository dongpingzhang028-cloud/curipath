"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOutForExpiredSession } from "@/lib/session-expired";

export function SaveProviderButton({
  providerId,
  initialSaved,
}: {
  providerId: string;
  initialSaved: boolean;
}) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setLoading(true);
    const nextSaved = !saved;

    try {
      const res = saved
        ? await fetch(`/api/saved-providers/${providerId}`, { method: "DELETE" })
        : await fetch("/api/saved-providers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ providerId }),
          });

      if (!res.ok) {
        if (res.status === 401) {
          await signOutForExpiredSession();
          return;
        }
        return;
      }

      setSaved(nextSaved);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm transition disabled:opacity-60 ${
        saved
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
      }`}
    >
      <span aria-hidden>{saved ? "★" : "☆"}</span>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
