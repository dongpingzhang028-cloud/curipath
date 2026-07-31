"use client";

import { useMemo, useState } from "react";

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  childId: string;
  childName: string;
  time: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CHILD_COLORS = [
  { dot: "bg-indigo-500", text: "text-indigo-700" },
  { dot: "bg-rose-500", text: "text-rose-700" },
  { dot: "bg-emerald-500", text: "text-emerald-700" },
  { dot: "bg-amber-500", text: "text-amber-700" },
  { dot: "bg-sky-500", text: "text-sky-700" },
  { dot: "bg-fuchsia-500", text: "text-fuchsia-700" },
  { dot: "bg-orange-500", text: "text-orange-700" },
  { dot: "bg-teal-500", text: "text-teal-700" },
];

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function BookingCalendar({ events }: { events: CalendarEvent[] }) {
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const key = toDateKey(new Date(e.date));
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const children = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of events) seen.set(e.childId, e.childName);
    return Array.from(seen, ([childId, childName]) => ({ childId, childName })).sort((a, b) =>
      a.childName.localeCompare(b.childName),
    );
  }, [events]);

  const childColors = useMemo(() => {
    const map = new Map<string, (typeof CHILD_COLORS)[number]>();
    children.forEach((child, i) => map.set(child.childId, CHILD_COLORS[i % CHILD_COLORS.length]));
    return map;
  }, [children]);

  const initialMonth = useMemo(() => {
    const upcoming = events.find((e) => new Date(e.date) >= new Date());
    const base = upcoming ? new Date(upcoming.date) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  }, [events]);

  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const todayKey = toDateKey(new Date());
  const monthLabel = viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const gridDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { date: Date; inMonth: boolean }[] = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, month, d), inMonth: true });
    }
    while (days.length % 7 !== 0) {
      const last = days[days.length - 1].date;
      days.push({
        date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
        inMonth: false,
      });
    }
    return days;
  }, [viewMonth]);

  const selectedEvents = selectedKey ? eventsByDate.get(selectedKey) ?? [] : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          className="rounded-full p-2 text-lg leading-none text-slate-500 hover:bg-slate-100"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="font-semibold text-slate-900">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          className="rounded-full p-2 text-lg leading-none text-slate-500 hover:bg-slate-100"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {gridDays.map(({ date, inMonth }) => {
          const key = toDateKey(date);
          const dayEvents = eventsByDate.get(key) ?? [];
          const hasEvents = dayEvents.length > 0;
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const dayChildIds = Array.from(new Set(dayEvents.map((e) => e.childId)));

          return (
            <button
              type="button"
              key={key}
              disabled={!hasEvents}
              onClick={() => setSelectedKey(isSelected ? null : key)}
              aria-label={`${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}${
                hasEvents ? `, ${dayEvents.length} booking${dayEvents.length > 1 ? "s" : ""}` : ""
              }`}
              className={[
                "flex h-12 flex-col items-center justify-center gap-1 rounded-lg text-sm transition-colors sm:h-14",
                inMonth ? "text-slate-700" : "text-slate-300",
                isSelected
                  ? "bg-indigo-600 text-white"
                  : hasEvents
                    ? "bg-indigo-50 hover:bg-indigo-100"
                    : "",
                isToday && !isSelected ? "ring-1 ring-inset ring-indigo-400" : "",
                hasEvents ? "cursor-pointer" : "cursor-default",
              ].join(" ")}
            >
              <span>{date.getDate()}</span>
              {hasEvents && (
                <span className="flex gap-0.5" aria-hidden>
                  {dayChildIds.map((childId) => (
                    <span
                      key={childId}
                      className={[
                        "h-1.5 w-1.5 rounded-full",
                        childColors.get(childId)?.dot ?? "bg-indigo-600",
                        isSelected ? "ring-1 ring-white" : "",
                      ].join(" ")}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {children.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-4">
          {children.map((child) => (
            <span key={child.childId} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span
                className={`h-2 w-2 rounded-full ${childColors.get(child.childId)?.dot ?? "bg-indigo-600"}`}
                aria-hidden
              />
              {child.childName}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-slate-100 pt-4">
        {selectedKey === null ? (
          <p className="text-sm text-slate-500">Tap a highlighted day to see what&apos;s booked.</p>
        ) : selectedEvents.length === 0 ? (
          <p className="text-sm text-slate-500">No bookings on this day.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {selectedEvents.map((e) => (
              <li key={e.id} className="flex items-start gap-2 text-sm">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${childColors.get(e.childId)?.dot ?? "bg-indigo-600"}`}
                  aria-hidden
                />
                <span>
                  <span className="font-medium text-slate-900">{e.title}</span>{" "}
                  <span className="text-slate-500">
                    for {e.childName} · {e.time}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
