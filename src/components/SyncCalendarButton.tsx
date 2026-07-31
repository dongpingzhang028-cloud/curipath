"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOutForExpiredSession } from "@/lib/session-expired";

type Child = { id: string; name: string; birthYear: number };

const NEW_CHILD_VALUE = "__new__";

export function SyncCalendarButton({ providerId }: { providerId: string }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>(NEW_CHILD_VALUE);
  const [newChildName, setNewChildName] = useState("");
  const [newChildBirthYear, setNewChildBirthYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function openForm() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setOpen(true);
    setSuccess(false);
    setError(null);
    setLoadingChildren(true);
    try {
      const res = await fetch("/api/children");
      if (res.ok) {
        const data = await res.json();
        setChildren(data.children);
        setSelectedChildId(data.children[0]?.id ?? NEW_CHILD_VALUE);
      }
    } finally {
      setLoadingChildren(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate || !startTime || !endTime) {
      setError("Please fill in the date range and time.");
      return;
    }

    setLoading(true);
    try {
      let childId = selectedChildId;

      if (selectedChildId === NEW_CHILD_VALUE) {
        const birthYear = Number(newChildBirthYear);
        if (!newChildName.trim() || !Number.isInteger(birthYear)) {
          setError("Please enter your child's name and birth year.");
          return;
        }

        const childRes = await fetch("/api/children", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newChildName.trim(), birthYear }),
        });
        const childData = await childRes.json();
        if (!childRes.ok) {
          if (childRes.status === 401) {
            await signOutForExpiredSession();
            return;
          }
          setError(childData.error || "Could not add child.");
          return;
        }
        childId = childData.child.id;
      }

      const res = await fetch("/api/calendar-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, childId, startDate, endDate, startTime, endTime }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          await signOutForExpiredSession();
          return;
        }
        setError(data.error || "Could not sync to your calendar.");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={openForm}
        aria-label="Add to calendar"
        title="Add to calendar"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-lg border border-slate-300 bg-white text-base shadow-sm transition hover:border-slate-400"
      >
        <span aria-hidden>📅</span>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-emerald-700">
              Added to your calendar! Check your{" "}
              <a href="/dashboard" className="underline">
                dashboard
              </a>
              .
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="self-start rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-900">Add to calendar</h2>

            {loadingChildren ? (
              <p className="text-sm text-slate-500">Loading your kids...</p>
            ) : (
              <div className="flex flex-col gap-2">
                {children.map((child) => (
                  <label
                    key={child.id}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50"
                  >
                    <input
                      type="radio"
                      name="syncChild"
                      checked={selectedChildId === child.id}
                      onChange={() => setSelectedChildId(child.id)}
                    />
                    {child.name} <span className="text-slate-400">· born {child.birthYear}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                  <input
                    type="radio"
                    name="syncChild"
                    checked={selectedChildId === NEW_CHILD_VALUE}
                    onChange={() => setSelectedChildId(NEW_CHILD_VALUE)}
                  />
                  Add a new child
                </label>
              </div>
            )}

            {selectedChildId === NEW_CHILD_VALUE && !loadingChildren && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Child's name"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Birth year"
                  value={newChildBirthYear}
                  onChange={(e) => setNewChildBirthYear(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Start date
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                End date
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Start time
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                End time
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "Syncing..." : "Add to calendar"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
