"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOutForExpiredSession } from "@/lib/session-expired";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });

      if (!res.ok) {
        if (res.status === 401) {
          await signOutForExpiredSession();
          return;
        }
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not cancel this booking.");
        setConfirming(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-600">Cancel this booking?</span>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="font-medium text-red-600 hover:underline disabled:opacity-60"
        >
          {loading ? "Cancelling..." : "Yes, cancel"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="font-medium text-slate-500 hover:underline"
        >
          Never mind
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-sm font-medium text-red-600 hover:underline"
    >
      Cancel booking
    </button>
  );
}
