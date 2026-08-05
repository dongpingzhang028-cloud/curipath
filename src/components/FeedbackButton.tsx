"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function FeedbackButton() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"feedback" | "bug">("feedback");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function openModal() {
    setOpen(true);
    setSuccess(false);
    setError(null);
    setMessage("");
    setEmail(session?.user?.email ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, email, pageUrl: pathname }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not submit feedback.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="hover:text-indigo-600"
      >
        Contact Us
      </button>

      {open && (
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
                  Thanks for letting us know! We read every submission.
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
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Contact Us</h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="text-lg leading-none text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType("feedback")}
                    className={`flex-1 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      type === "feedback"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    💡 Suggestion
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("bug")}
                    className={`flex-1 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      type === "bug"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    🐛 Report an issue
                  </button>
                </div>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  {type === "bug" ? "What went wrong?" : "What's on your mind?"}
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      type === "bug"
                        ? "What happened, and what did you expect instead?"
                        : "Ideas, requests, or anything else you'd like us to know."
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  Email (optional, if you&apos;d like a reply)
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </label>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="self-start rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
