import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SEO_CITIES } from "@/lib/seo-pages";

// Must be the canonical host: the apex domain 308-redirects to www, so
// emitting apex URLs here makes every entry in the sitemap a redirect.
const BASE_URL = "https://www.curipath.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const providers = await prisma.provider.findMany({
    select: { id: true },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const providerRoutes: MetadataRoute.Sitemap = providers.map((p) => ({
    url: `${BASE_URL}/providers/${p.id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // City x category landing pages — only combos that actually have providers.
  // Empty combos render with noindex and must stay out of the sitemap.
  const [combos, categories] = await Promise.all([
    prisma.provider.groupBy({ by: ["location", "categoryId"], _count: true }),
    prisma.category.findMany({ select: { id: true, slug: true } }),
  ]);
  const slugByCategoryId = new Map(categories.map((c) => [c.id, c.slug]));
  const slugByLocation = new Map(SEO_CITIES.map((c) => [c.location, c.slug]));
  const landingRoutes: MetadataRoute.Sitemap = combos.flatMap((combo) => {
    const citySlug = slugByLocation.get(combo.location);
    const categorySlug = combo.categoryId ? slugByCategoryId.get(combo.categoryId) : undefined;
    if (!citySlug || !categorySlug || combo._count === 0) return [];
    return [
      {
        url: `${BASE_URL}/classes/${citySlug}/${categorySlug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
    ];
  });

  return [...staticRoutes, ...landingRoutes, ...providerRoutes];
}
