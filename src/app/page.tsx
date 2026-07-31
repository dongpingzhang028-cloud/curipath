import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProviderCard } from "@/components/ProviderCard";
import { HeroSearch } from "@/components/HeroSearch";

export default async function Home() {
  const session = await auth();

  const [categories, featuredProviders, providerLocations, savedProviders, enrollments] =
    await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.provider.findMany({
        take: 4,
        orderBy: { id: "asc" },
        include: { category: true },
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

  return (
    <div>
      <section className="bg-gradient-to-b from-indigo-50 to-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
          <h1 className="font-display text-4xl font-extrabold text-slate-900 sm:text-5xl">
            Discover, Compare, Book
          </h1>
          <p className="max-w-xl text-lg text-slate-600">
            Helping every child discover their next passion.
          </p>
          <HeroSearch locations={locations} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-5 text-xl font-bold text-slate-900">Browse by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/explore?category=${category.slug}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-3xl">{category.icon}</span>
              <span className="text-sm font-medium text-slate-700">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Featured Program</h2>
          <Link href="/explore" className="text-sm font-medium text-indigo-600 hover:underline">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isSaved={savedProviderIds.has(provider.id)}
              isEnrolled={enrolledProviderIds.has(provider.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
