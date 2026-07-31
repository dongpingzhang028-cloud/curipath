import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProviderCard } from "@/components/ProviderCard";
import { ExploreFilters } from "@/components/ExploreFilters";
import { AllLocationsMap, type LocationPin } from "@/components/AllLocationsMap";
import type { Prisma } from "@/generated/prisma";

type SearchParams = {
  category?: string;
  age?: string;
  q?: string;
  location?: string;
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await auth();

  const where: Prisma.ProviderWhereInput = {};

  if (params.age) {
    const age = Number(params.age);
    if (!Number.isNaN(age)) {
      where.minAge = { lte: age };
      where.maxAge = { gte: age };
    }
  }
  if (params.category) {
    where.category = { slug: params.category };
  }
  if (params.location) {
    where.location = params.location;
  }
  if (params.q) {
    where.OR = [{ name: { contains: params.q } }, { bio: { contains: params.q } }];
  }

  const [categories, providers, providerLocations, savedProviders, enrollments] =
    await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.provider.findMany({
        where,
        include: { category: true },
        orderBy: { name: "asc" },
      }),
      prisma.provider.findMany({
        distinct: ["location"],
        select: { location: true },
        orderBy: { location: "asc" },
      }),
      session?.user?.id
        ? prisma.savedProvider.findMany({
            where: { parentId: session.user.id },
            select: { providerId: true },
          })
        : Promise.resolve([]),
      session?.user?.id
        ? prisma.enrollment.findMany({
            where: { parentId: session.user.id },
            select: { providerId: true },
          })
        : Promise.resolve([]),
    ]);

  const locations = providerLocations.map((p) => p.location);
  const savedProviderIds = new Set(savedProviders.map((s) => s.providerId));
  const enrolledProviderIds = new Set(enrollments.map((e) => e.providerId));

  let locationPins: LocationPin[] = [];
  if (params.category) {
    const addressGroups = new Map<string, { label: string; count: number }>();
    for (const p of providers) {
      const address = p.address ?? p.location;
      const existing = addressGroups.get(address);
      if (existing) {
        existing.count += 1;
      } else {
        addressGroups.set(address, { label: p.name, count: 1 });
      }
    }
    locationPins = Array.from(addressGroups.entries()).map(([address, { label, count }]) => ({
      id: address,
      label,
      address,
      count,
    }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Explore Programs</h1>
      <p className="mb-6 text-sm text-slate-500">
        {providers.length} {providers.length === 1 ? "provider" : "providers"} found
      </p>

      <Suspense>
        <ExploreFilters categories={categories} locations={locations} />
      </Suspense>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-stretch">
        <div className="flex-1">
          {providers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No providers match your filters. Try broadening your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  isSaved={savedProviderIds.has(provider.id)}
                  isEnrolled={enrolledProviderIds.has(provider.id)}
                />
              ))}
            </div>
          )}
        </div>

        {locationPins.length > 0 && (
          <div className="flex h-72 flex-col lg:sticky lg:top-24 lg:h-auto lg:max-h-[calc(100vh-8rem)] lg:w-80 lg:shrink-0">
            <h2 className="mb-3 text-lg font-bold text-slate-900">
              Where these providers are located
            </h2>
            <div className="flex-1">
              <AllLocationsMap pins={locationPins} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
