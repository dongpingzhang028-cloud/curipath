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
  minAge: number | null;
  maxAge: number | null;
  websiteUrl: string | null;
  category: { name: string; icon: string } | null;
  googleRating: number | null;
  reviewPros: string | null;
  reviewCons: string | null;
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
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition group-hover:bg-indigo-700">
          View details →
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

              {provider.bio && (
                <div>
                  <span className="text-sm font-semibold text-slate-900">About this program</span>
                  <p className="mt-1 text-sm text-slate-600">{provider.bio}</p>
                </div>
              )}

              {(provider.googleRating != null || provider.reviewPros || provider.reviewCons) && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      What other people think about this program
                    </span>
                    {provider.googleRating != null && (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                        <span aria-hidden>★</span>
                        {provider.googleRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {provider.reviewPros && (
                    <div className="mt-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        👍 What people like
                      </span>
                      <p className="mt-0.5 text-sm text-slate-600">{provider.reviewPros}</p>
                    </div>
                  )}
                  {provider.reviewCons && (
                    <div className="mt-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                        👎 Worth knowing
                      </span>
                      <p className="mt-0.5 text-sm text-slate-600">{provider.reviewCons}</p>
                    </div>
                  )}
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
