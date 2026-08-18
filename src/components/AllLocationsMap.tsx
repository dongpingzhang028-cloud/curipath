"use client";

import { useEffect, useRef } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

export type PinProvider = {
  id: string;
  name: string;
  imageUrl: string;
  categoryIcon: string | null;
  categoryName: string | null;
  googleRating: number | null;
  minAge: number | null;
  maxAge: number | null;
};

export type LocationPin = {
  id: string;
  address: string;
  // Stored coordinates from the DB. Pins without them are skipped — the map
  // must never fall back to the client-side Geocoding API (geocoding every
  // pin per visit once produced a surprise bill).
  lat: number | null;
  lng: number | null;
  providers: PinProvider[];
};

const US_CENTER = { lat: 39.8283, lng: -98.5795 };

function Markers({ pins }: { pins: LocationPin[] }) {
  const map = useMap();
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    const infoWindow = new google.maps.InfoWindow();

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Positions come straight from stored provider coordinates — no
    // Geocoding API calls in the browser, ever.
    const found = pins
      .filter((pin) => pin.lat != null && pin.lng != null)
      .map((pin) => ({
        pin,
        position: new google.maps.LatLng(pin.lat!, pin.lng!),
      }));
    {
      const bounds = new google.maps.LatLngBounds();

      const markers = found.map(({ pin, position }) => {
        const markerTitle = pin.providers.map((p) => p.name).join(", ");
        const marker = new google.maps.Marker({ map, position, title: markerTitle });
        marker.addListener("click", () => {
          const rows = pin.providers
            .map((p, i) => {
              const rating =
                p.googleRating != null
                  ? `<span style="font-size:11px;color:#d97706;">★ ${p.googleRating.toFixed(1)}</span>`
                  : "";
              const ageTag =
                p.minAge != null && p.maxAge != null
                  ? `<span style="font-size:11px;color:#475569;background:#f1f5f9;border-radius:9999px;padding:1px 6px;">Ages ${p.minAge}–${p.maxAge}</span>`
                  : "";
              const categoryTag =
                p.categoryName != null
                  ? `<span style="font-size:11px;color:#475569;background:#f1f5f9;border-radius:9999px;padding:1px 6px;">${p.categoryIcon ? `${p.categoryIcon} ` : ""}${p.categoryName}</span>`
                  : "";
              const marginTop = i > 0 ? "margin-top:10px;border-top:1px solid #e2e8f0;padding-top:10px;" : "";
              return `<div style="${marginTop}">
                <div style="display:flex;align-items:flex-start;gap:8px;">
                  <img src="${p.imageUrl}" alt="" style="width:32px;height:32px;object-fit:cover;border-radius:6px;flex-shrink:0;" />
                  <div style="min-width:0;">
                    <div style="font-size:12px;font-weight:600;color:#1e293b;line-height:1.3;">${p.name}</div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-top:3px;">${rating}${ageTag}${categoryTag}</div>
                  </div>
                </div>
                <a href="/providers/${p.id}" style="display:block;margin-top:6px;text-align:center;font-size:12px;font-weight:600;color:#fff;background:#4f46e5;border-radius:9999px;padding:4px 0;text-decoration:none;">View Detail →</a>
              </div>`;
            })
            .join("");
          infoWindow.setContent(`<div style="width:200px;">${rows}</div>`);
          infoWindow.open({ map, anchor: marker });
        });
        bounds.extend(position);
        return marker;
      });
      markersRef.current = markers;

      if (found.length === 1) {
        map.setCenter(found[0].position);
        map.setZoom(11);
      } else if (found.length > 1) {
        map.fitBounds(bounds, 48);
      }
    }

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
    };
  }, [map, pins]);

  return null;
}

export function AllLocationsMap({ pins }: { pins: LocationPin[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (pins.length === 0) return null;

  if (!apiKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        <p>Map unavailable.</p>
        <p>Add a Google Maps API key to .env as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-slate-200">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={US_CENTER}
          defaultZoom={4}
          gestureHandling="greedy"
          style={{ width: "100%", height: "100%" }}
        >
          <Markers pins={pins} />
        </Map>
      </APIProvider>
    </div>
  );
}
