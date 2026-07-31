"use client";

import Image from "next/image";
import { useState } from "react";
import { formatAgeRange } from "@/lib/format";

export type QuickViewProvider = {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  location: string;
  address: string | null;
  keywords: string[];
  minAge: number | null;
  maxAge: number | null;
  websiteUrl: string | null;
  category: { name: string; icon: string } | null;
  googleReviewSummary: string | null;
};

export function ProviderQuickView({ provider }: { provider: QuickViewProvider }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative h-40 w-full overflow-hidden bg-slate-100 text-left"
      >
        <Image
          src={provider.imageUrl}
          alt={provider.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {provider.category && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm">
            {provider.category.icon} {provider.category.name}
          </span>
        )}
        <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-sm transition group-hover:opacity-100">
          View details
        </span>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 pb-1 pt-4 text-left"
      >
        <h3 className="line-clamp-2 min-h-12 font-semibold text-slate-900 hover:text-indigo-600">
          {provider.name}
        </h3>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-56 w-full shrink-0 bg-slate-100">
              <Image
                src={provider.imageUrl}
                alt={provider.name}
                fill
                sizes="512px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg leading-none text-slate-700 shadow-sm hover:bg-white"
              >
                ×
              </button>
              {provider.category && (
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm">
                  {provider.category.icon} {provider.category.name}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto p-5">
              <h2 className="text-xl font-bold text-slate-900">{provider.name}</h2>

              <p className="flex items-start gap-1 text-sm text-slate-500">
                <span aria-hidden>📍</span>
                {provider.address || provider.location}
              </p>

              {provider.minAge != null && provider.maxAge != null && (
                <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                  {formatAgeRange(provider.minAge, provider.maxAge)}
                </span>
              )}

              {provider.bio && <p className="text-sm text-slate-600">{provider.bio}</p>}

              {provider.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {provider.keywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      🏷️ {keyword}
                    </span>
                  ))}
                </div>
              )}

              {provider.googleReviewSummary && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-sm font-semibold text-slate-900">
                    What other people think about this program
                  </span>
                  <p className="mt-1 text-sm text-slate-600">{provider.googleReviewSummary}</p>
                </div>
              )}

              {provider.websiteUrl && (
                <a
                  href={provider.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Book on the website
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
