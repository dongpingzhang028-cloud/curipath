"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HeroSearch({ locations }: { locations: string[] }) {
  const router = useRouter();
  const [location, setLocation] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    router.push(`/explore?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
    >
      <select
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        aria-label="Search by location"
        className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none"
      >
        <option value="">Any location</option>
        {locations.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="whitespace-nowrap rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700"
      >
        Explore Programs
      </button>
    </form>
  );
}
