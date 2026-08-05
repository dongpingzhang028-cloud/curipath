import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ExploreFilters } from "@/components/ExploreFilters";
import { ExploreResults } from "@/components/ExploreResults";
import type { LocationPin } from "@/components/AllLocationsMap";
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
  if (params.q) {
    where.OR = [{ name: { contains: params.q } }, { bio: { contains: params.q } }];
  }

  const [categories, providers, providerLocations, savedProviders, enrollments] =
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

      <ExploreResults
        providers={providers.map((provider) => ({
          ...provider,
          isSaved: savedProviderIds.has(provider.id),
          isEnrolled: enrolledProviderIds.has(provider.id),
        }))}
        locationPins={locationPins}
      />
    </div>
  );
}
