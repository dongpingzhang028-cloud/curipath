import Link from "next/link";
import Image from "next/image";
import { SaveProviderButton } from "@/components/SaveProviderButton";
import { EnrollButton } from "@/components/EnrollButton";
import { StarRating } from "@/components/StarRating";
import { formatAgeRange } from "@/lib/format";

export type ProviderCardData = {
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

export function ProviderCard({
  provider,
  isSaved,
  isEnrolled = false,
}: {
  provider: ProviderCardData;
  isSaved: boolean;
  isEnrolled?: boolean;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Link
        href={`/providers/${provider.id}`}
        className="group relative block h-40 w-full overflow-hidden bg-slate-100"
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
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-3">
        <Link
          href={`/providers/${provider.id}`}
          className="line-clamp-2 min-h-12 font-semibold text-slate-900 hover:text-indigo-600"
        >
          {provider.name}
        </Link>

        <div className="h-5">
          {provider.googleRating != null && <StarRating rating={provider.googleRating} />}
        </div>

        <p className="flex items-center gap-1 text-sm text-slate-500">
          <span aria-hidden>📍</span>
          {provider.location}
        </p>

        {provider.minAge != null && provider.maxAge != null && (
          <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {formatAgeRange(provider.minAge, provider.maxAge)}
          </span>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <SaveProviderButton providerId={provider.id} initialSaved={isSaved} />
            <EnrollButton providerId={provider.id} initialEnrolled={isEnrolled} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/providers/${provider.id}`}
              className="inline-flex items-center gap-1.5 self-start rounded-full border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
              View Detail →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
