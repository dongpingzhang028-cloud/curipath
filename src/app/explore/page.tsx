import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ExploreFilters } from "@/components/ExploreFilters";
import { ExploreResults } from "@/components/ExploreResults";
import type { LocationPin } from "@/components/AllLocationsMap";
import type { Prisma } from "@/generated/prisma";

// The filters live in the query string (category, age, location, trial, q),
// so this route can be reached through hundreds of permutations that all show
// the same page. Canonicalising to the bare /explore consolidates them instead
// of letting Google treat each combination as its own near-duplicate page.
export const metadata: Metadata = {
  title: "Explore Programs — CuriPath",
  description:
    "Browse kids' classes across Seattle and the Eastside by category, age, and location.",
  alternates: { canonical: "/explore" },
};

type SearchParams = {
  category?: string;
  age?: string;
  q?: string;
  location?: string;
  trial?: string;
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
    // params.age encodes a bucket range as "min-max" (e.g. "5-7"). Match any
    // provider whose [minAge, maxAge] range overlaps the bucket at all,
    // rather than requiring a single representative age to fall inside it —
    // that point-check wrongly excluded providers like a 0-3 program from
    // "Under 5", or a 15-18 program from "14+".
    const [bucketMinStr, bucketMaxStr] = params.age.split("-");
    const bucketMin = Number(bucketMinStr);
    const bucketMax = Number(bucketMaxStr);
    if (!Number.isNaN(bucketMin) && !Number.isNaN(bucketMax)) {
      where.minAge = { lte: bucketMax };
      where.maxAge = { gte: bucketMin };
    }
  }
  if (params.category) {
    where.category = { slug: params.category };
  }
  if (params.location) {
    where.location = params.location;
  }
  if (params.trial) {
    where.hasFreeTrial = true;
  }
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { bio: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const [categories, providers, providerLocations, savedProviders] =
    await Promise.all([
      prisma.category.findMany({ orderBy: { order: "asc" } }),
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
    ]);

  const locations = providerLocations.map((p) => p.location);
  const savedProviderIds = new Set(savedProviders.map((s) => s.providerId));

  // Pins mirror whatever the current filters return, so the map is available
  // on every Explore view rather than only once a category is chosen — that
  // gate was why the mobile List/Map toggle never appeared by default.
  // Providers sharing an address collapse into one pin.
  const addressGroups = new Map<
    string,
    { lat: number | null; lng: number | null; providers: LocationPin["providers"] }
  >();
  for (const p of providers) {
    const address = p.address ?? p.location;
    const group = addressGroups.get(address) ?? {
      lat: p.latitude,
      lng: p.longitude,
      providers: [],
    };
    group.providers.push({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      categoryIcon: p.category?.icon ?? null,
      categoryName: p.category?.name ?? null,
      googleRating: p.googleRating,
      minAge: p.minAge,
      maxAge: p.maxAge,
    });
    addressGroups.set(address, group);
  }
  const locationPins: LocationPin[] = Array.from(addressGroups.entries()).map(
    ([address, group]) => ({
      id: address,
      address,
      lat: group.lat,
      lng: group.lng,
      providers: group.providers,
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Explore Programs</h1>
      <p className="mb-6 text-sm text-slate-500">
        {providers.length} {providers.length === 1 ? "provider" : "providers"} found
      </p>

      <Suspense>
        <ExploreFilters categories={categories} locations={locations} />
      </Suspense>

      <ExploreResults
        providers={providers.map((provider) => ({
          ...provider,
          isSaved: savedProviderIds.has(provider.id),
        }))}
        locationPins={locationPins}
      />
    </div>
  );
}
