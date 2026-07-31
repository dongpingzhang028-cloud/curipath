import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatSessionTime } from "@/lib/format";
import { AddChildForm } from "@/components/AddChildForm";
import { BookingCalendar } from "@/components/BookingCalendar";
import { ProviderCard } from "@/components/ProviderCard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const [children, savedPrograms, calendarSyncs, enrollments] =
    await Promise.all([
      prisma.child.findMany({ where: { parentId: session.user.id }, orderBy: { name: "asc" } }),
      prisma.savedProvider.findMany({
        where: { parentId: session.user.id },
        include: { provider: { include: { category: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.calendarSync.findMany({
        where: { parentId: session.user.id },
        include: { child: true, provider: true },
      }),
      prisma.enrollment.findMany({
        where: { parentId: session.user.id },
        include: { provider: { include: { category: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const savedProviderIds = new Set(savedPrograms.map((sp) => sp.providerId));
  const enrolledProviderIds = new Set(enrollments.map((e) => e.providerId));
  const enrolledProviders = enrollments.map((e) => e.provider);

  function timeOnDay(day: Date, time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const d = new Date(day);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  const syncedEvents = calendarSyncs.flatMap((sync) => {
    const events = [];
    const day = new Date(sync.startDate);
    while (day <= sync.endDate) {
      const start = timeOnDay(day, sync.startTime);
      const end = timeOnDay(day, sync.endTime);
      events.push({
        id: `${sync.id}-${day.toISOString().slice(0, 10)}`,
        date: start.toISOString(),
        title: sync.provider.name,
        childId: sync.childId,
        childName: sync.child.name,
        time: formatSessionTime(start, end),
      });
      day.setDate(day.getDate() + 1);
    }
    return events;
  });

  const calendarEvents = syncedEvents;

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
        <h2 className="mb-4 text-lg font-bold text-slate-900">Calendar</h2>
        {calendarEvents.length === 0 ? (
          <p className="text-sm text-slate-500">
            Programs you sync to your calendar will show up here.
          </p>
        ) : (
          <BookingCalendar events={calendarEvents} />
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
                isEnrolled={enrolledProviderIds.has(provider.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Enrolled Programs</h2>
        {enrolledProviders.length === 0 ? (
          <p className="text-sm text-slate-500">
            No enrolled programs yet.{" "}
            <Link href="/explore" className="font-medium text-indigo-600 hover:underline">
              Explore classes
            </Link>{" "}
            and mark one as enrolled.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isSaved={savedProviderIds.has(provider.id)}
                isEnrolled={enrolledProviderIds.has(provider.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
