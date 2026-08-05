"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

type Category = { slug: string; name: string; icon: string };

// Each value encodes the bucket's actual [min-max] age range (not a single
// representative age), so filtering can check for real overlap with a
// provider's [minAge, maxAge] instead of a single point falling inside it.
const AGE_OPTIONS = [
  { label: "Any age", value: "" },
  { label: "Under 5", value: "0-4" },
  { label: "5–7", value: "5-7" },
  { label: "8–10", value: "8-10" },
  { label: "11–13", value: "11-13" },
  { label: "14+", value: "14-99" },
];

export function ExploreFilters({
  categories,
  locations,
}: {
  categories: Category[];
  locations: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("q", query);
        }}
        className="flex flex-1 min-w-[200px] gap-2"
      >
        <input
          type="text"
          placeholder="Search providers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Search
        </button>
      </form>

      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
        className="rounded-full border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.icon} {c.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("age") ?? ""}
        onChange={(e) => updateParam("age", e.target.value)}
        className="rounded-full border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      >
        {AGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("location") ?? ""}
        onChange={(e) => updateParam("location", e.target.value)}
        className="rounded-full border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      >
        <option value="">Any location</option>
        {locations.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>

      {(searchParams.get("category") ||
        searchParams.get("age") ||
        searchParams.get("location") ||
        searchParams.get("q")) && (
        <button
          onClick={() => {
            setQuery("");
            router.push(pathname);
          }}
          className="text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
