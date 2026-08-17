import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProviderCard } from "@/components/ProviderCard";
import { CATEGORY_PHRASES, SEO_CITIES, cityBySlug } from "@/lib/seo-pages";

// One SEO landing page per city x category ("Kids Swim Lessons in Bellevue,
// WA"). Populated combos are indexable and listed in the sitemap; empty
// combos still render a useful page but carry noindex until providers exist,
// so thin pages never reach Google.

const getData = cache(async (citySlug: string, categorySlug: string) => {
  const city = cityBySlug(citySlug);
  const phrase = CATEGORY_PHRASES[categorySlug];
  if (!city || !phrase) return null;

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) return null;

  const providers = await prisma.provider.findMany({
    where: { location: city.location, categoryId: category.id },
    include: { category: true },
    orderBy: [{ googleRating: { sort: "desc", nulls: "last" } }, { name: "asc" }],
  });

  // Counts that drive the cross-link sections, fetched in one query each:
  // sibling categories in this city, and this category across other cities.
  const [cityCounts, categoryCounts] = await Promise.all([
    prisma.provider.groupBy({
      by: ["categoryId"],
      where: { location: city.location },
      _count: true,
    }),
    prisma.provider.groupBy({
      by: ["location"],
      where: { categoryId: category.id },
      _count: true,
    }),
  ]);
  const allCategories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return { city, phrase, category, providers, cityCounts, categoryCounts, allCategories };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}): Promise<Metadata> {
  const { city: citySlug, category: categorySlug } = await params;
  const data = await getData(citySlug, categorySlug);
  if (!data) return { title: "Page not found — CuriPath" };

  const { city, phrase, providers } = data;
  const trialCount = providers.filter((p) => p.hasFreeTrial).length;
  const title = `${phrase} in ${city.name}, WA — CuriPath`;
  const description =
    providers.length > 0
      ? `Compare ${providers.length} verified option${
          providers.length === 1 ? "" : "s"
        } for ${phrase.toLowerCase()} in ${city.name}, WA — ratings, ages served${
          trialCount > 0 ? `, and ${trialCount} with a free trial` : ""
        }. Book directly with local providers.`
      : `${phrase} in ${city.name}, WA on CuriPath — new providers are being added. Explore nearby cities and other activities for kids.`;

  return {
    title,
    description,
    alternates: { canonical: `/classes/${citySlug}/${categorySlug}` },
    // Empty combos stay out of the index until they have real content.
    ...(providers.length === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ClassesLandingPage({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}) {
  const { city: citySlug, category: categorySlug } = await params;
  const data = await getData(citySlug, categorySlug);
  if (!data) notFound();

  const { city, phrase, category, providers, cityCounts, categoryCounts, allCategories } = data;
  const session = await auth();
  const [savedProviders, enrollments] = await Promise.all([
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
  const savedIds = new Set(savedProviders.map((s) => s.providerId));
  const enrolledIds = new Set(enrollments.map((e) => e.providerId));

  const trials = providers.filter((p) => p.hasFreeTrial);
  const rated = providers.filter((p) => p.googleRating != null);
  const topRated = rated.slice(0, 3);
  const ages = providers.filter((p) => p.minAge != null || p.maxAge != null);
  const minAge = ages.length ? Math.min(...ages.map((p) => p.minAge ?? 99)) : null;
  const maxAge = ages.length ? Math.max(...ages.map((p) => p.maxAge ?? 0)) : null;

  const otherCategories = allCategories.filter(
    (c) => c.slug !== category.slug && cityCounts.some((x) => x.categoryId === c.id && x._count > 0),
  );
  const otherCities = SEO_CITIES.filter(
    (c) => c.slug !== city.slug && categoryCounts.some((x) => x.location === c.location && x._count > 0),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "CuriPath", item: "https://www.curipath.com" },
          {
            "@type": "ListItem",
            position: 2,
            name: `${city.name}, WA`,
            item: `https://www.curipath.com/explore?location=${encodeURIComponent(city.location)}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: phrase,
            item: `https://www.curipath.com/classes/${city.slug}/${category.slug}`,
          },
        ],
      },
      ...(providers.length > 0
        ? [
            {
              "@type": "ItemList",
              name: `${phrase} in ${city.name}, WA`,
              numberOfItems: providers.length,
              itemListElement: providers.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: p.name,
                url: `https://www.curipath.com/providers/${p.id}`,
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>
        <span aria-hidden> / </span>
        <Link
          href={`/explore?location=${encodeURIComponent(city.location)}`}
          className="hover:text-indigo-600"
        >
          {city.name}
        </Link>
        <span aria-hidden> / </span>
        <span className="text-slate-700">{category.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900">
        {category.icon} {phrase} in {city.name}, WA
      </h1>

      {providers.length > 0 ? (
        <p className="mt-3 max-w-3xl text-slate-600">
          {city.name} has {providers.length} verified option
          {providers.length === 1 ? "" : "s"} for {phrase.toLowerCase()} on CuriPath
          {minAge != null && maxAge != null && maxAge > 0
            ? `, serving ages ${minAge} through ${maxAge}`
            : ""}
          .{" "}
          {topRated.length > 0 &&
            `Top rated by parents: ${topRated
              .map((p) => `${p.name} (${p.googleRating!.toFixed(1)}★)`)
              .join(", ")}. `}
          {trials.length > 0 &&
            `${trials.length} offer${trials.length === 1 ? "s" : ""} a genuinely free trial class, so your child can try before you commit.`}
        </p>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-lg font-medium text-slate-700">
            We haven&apos;t verified any {phrase.toLowerCase()} in {city.name} yet.
          </p>
          <p className="mt-2 text-slate-500">
            We add real, verified providers only — check the nearby cities below, or browse other
            activities in {city.name}.
          </p>
        </div>
      )}

      {providers.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isSaved={savedIds.has(provider.id)}
              isEnrolled={enrolledIds.has(provider.id)}
            />
          ))}
        </div>
      )}

      {otherCategories.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold text-slate-900">
            More kids&apos; activities in {city.name}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {otherCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/classes/${city.slug}/${c.slug}`}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600"
              >
                {c.icon} {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {otherCities.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-slate-900">{phrase} in nearby cities</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                href={`/classes/${c.slug}/${category.slug}`}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
