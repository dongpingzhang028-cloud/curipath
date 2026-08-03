import { SaveProviderButton } from "@/components/SaveProviderButton";
import { SyncCalendarButton } from "@/components/SyncCalendarButton";
import { EnrollButton } from "@/components/EnrollButton";
import { ProviderQuickView } from "@/components/ProviderQuickView";

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
      <ProviderQuickView provider={provider} />

      <div className="flex flex-1 flex-col gap-1 px-4 pb-4">
        <p className="flex items-center gap-1 text-sm text-slate-500">
          <span aria-hidden>📍</span>
          {provider.location}
        </p>

        <div className="mt-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <SaveProviderButton providerId={provider.id} initialSaved={isSaved} />
            <EnrollButton providerId={provider.id} initialEnrolled={isEnrolled} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {provider.websiteUrl && (
              <a
                href={provider.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 self-start rounded-full border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                Book on the website
              </a>
            )}
            <SyncCalendarButton providerId={provider.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
