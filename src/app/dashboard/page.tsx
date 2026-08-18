import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddChildForm } from "@/components/AddChildForm";
import { ProviderCard } from "@/components/ProviderCard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const [children, savedPrograms] =
    await Promise.all([
      prisma.child.findMany({ where: { parentId: session.user.id }, orderBy: { name: "asc" } }),
      prisma.savedProvider.findMany({
        where: { parentId: session.user.id },
        include: { provider: { include: { category: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);


  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">My kids</h2>
          <AddChildForm />
        </div>
        {children.length === 0 ? (
          <p className="text-sm text-slate-500">You haven&apos;t added any kids yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {children.map((child) => (
              <span
                key={child.id}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
              >
                {child.name} · born {child.birthYear}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Saved Programs</h2>
        {savedPrograms.length === 0 ? (
          <p className="text-sm text-slate-500">
            No saved programs yet.{" "}
            <Link href="/explore" className="font-medium text-indigo-600 hover:underline">
              Explore classes
            </Link>{" "}
            to save one.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedPrograms.map(({ provider }) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isSaved
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
