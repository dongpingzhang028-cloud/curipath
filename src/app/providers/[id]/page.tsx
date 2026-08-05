import { cache } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatAgeRange } from "@/lib/format";
import { StarRating } from "@/components/StarRating";

// Memoized per-request so generateMetadata and the page component below
// share one DB query instead of two.
const getProvider = cache((id: string) =>
  prisma.provider.findUnique({ where: { id }, include: { category: true } }),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const provider = await getProvider(id);

  if (!provider) {
    return { title: "Program not found — CuriPath" };
  }

  const description =
    provider.bio || `${provider.name} in ${provider.location} — find and book on CuriPath.`;

  return {
    title: `${provider.name} — CuriPath`,
    description,
    openGraph: {
      title: provider.name,
      description,
      images: [{ url: provider.imageUrl }],
    },
  };
}

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const provider = await getProvider(id);

  if (!provider) {
    notFound();
  }

  const detailedAddress = provider.address || provider.location;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detailedAddress)}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/explore" className="text-sm font-medium text-indigo-600 hover:underline">
        ← Back to Explore
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-64 w-full bg-slate-100 sm:h-80">
          <Image
            src={provider.imageUrl}
            alt={provider.name}
            fill
            sizes="768px"
            className="object-cover"
            priority
          />
          {provider.category && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
              {provider.category.icon} {provider.category.name}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-2xl font-bold text-slate-900">{provider.name}</h1>
            {provider.googleRating != null && <StarRating rating={provider.googleRating} size="md" />}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <p className="flex items-center gap-1 text-sm text-slate-500">
              <span aria-hidden>📍</span>
              {provider.location}
            </p>
            {provider.minAge != null && provider.maxAge != null && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {formatAgeRange(provider.minAge, provider.maxAge)}
              </span>
            )}
          </div>

          {provider.bio && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900">About this program</h2>
              <p className="mt-1 text-sm text-slate-600">{provider.bio}</p>
            </div>
          )}

          {(provider.googleRating != null || provider.reviewPros || provider.reviewCons) && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
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
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <a
                href={provider.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                Book on the website
              </a>
            </div>
          )}

          <div>
            <span className="text-sm font-semibold text-slate-900">Address</span>
            <p className="mt-1 text-sm text-slate-600">{detailedAddress}</p>
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
            >
              Get directions →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
