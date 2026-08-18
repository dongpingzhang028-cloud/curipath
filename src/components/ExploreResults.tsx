"use client";

import { useState } from "react";
import { ProviderCard, type ProviderCardData } from "@/components/ProviderCard";
import { AllLocationsMap, type LocationPin } from "@/components/AllLocationsMap";

type ProviderWithFlags = ProviderCardData & { isSaved: boolean };

export function ExploreResults({
  providers,
  locationPins,
}: {
  providers: ProviderWithFlags[];
  locationPins: LocationPin[];
}) {
  const [view, setView] = useState<"list" | "map">("list");
  const hasMap = locationPins.length > 0;

  return (
    <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-stretch">
      {hasMap && (
        <div className="flex gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              view === "list"
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            📋 List
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
              view === "map"
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            🗺️ Map
          </button>
        </div>
      )}

      <div className={`flex-1 ${hasMap && view !== "list" ? "hidden" : ""} lg:block`}>
        {providers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No providers match your filters. Try broadening your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isSaved={provider.isSaved}
              />
            ))}
          </div>
        )}
      </div>

      {hasMap && (
        <div
          className={`h-[70vh] flex-col lg:sticky lg:top-24 lg:h-auto lg:max-h-[calc(100vh-8rem)] lg:w-80 lg:shrink-0 ${
            view === "map" ? "flex" : "hidden"
          } lg:flex`}
        >
          <h2 className="mb-3 text-lg font-bold text-slate-900">
            Where these providers are located
          </h2>
          <div className="flex-1">
            <AllLocationsMap pins={locationPins} />
          </div>
        </div>
      )}
    </div>
  );
}
