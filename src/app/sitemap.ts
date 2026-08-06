import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://curipath.com";

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

  return [...staticRoutes, ...providerRoutes];
}
