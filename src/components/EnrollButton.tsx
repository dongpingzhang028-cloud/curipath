"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOutForExpiredSession } from "@/lib/session-expired";

export function EnrollButton({
  providerId,
  initialEnrolled,
}: {
  providerId: string;
  initialEnrolled: boolean;
}) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setLoading(true);
    const nextEnrolled = !enrolled;

    try {
      const res = enrolled
        ? await fetch(`/api/enrollments/${providerId}`, { method: "DELETE" })
        : await fetch("/api/enrollments", {
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

      setEnrolled(nextEnrolled);
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
        enrolled
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
      }`}
    >
      <span aria-hidden>✓</span>
      Enrolled
    </button>
  );
}
