"use client";

import { useEffect, useRef } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

export type LocationPin = { id: string; label: string; address: string; count: number };

const US_CENTER = { lat: 39.8283, lng: -98.5795 };

function Markers({ pins }: { pins: LocationPin[] }) {
  const map = useMap();
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    let cancelled = false;
    const geocoder = new google.maps.Geocoder();
    const infoWindow = new google.maps.InfoWindow();

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    Promise.all(
      pins.map(
        (pin) =>
          new Promise<{ pin: LocationPin; position: google.maps.LatLng } | null>((resolve) => {
            geocoder.geocode({ address: pin.address }, (results, status) => {
              if (status === "OK" && results?.[0]) {
                resolve({ pin, position: results[0].geometry.location });
              } else {
                resolve(null);
              }
            });
          }),
      ),
    ).then((resolved) => {
      if (cancelled) return;

      const found = resolved.filter(
        (r): r is { pin: LocationPin; position: google.maps.LatLng } => r !== null,
      );
      const bounds = new google.maps.LatLngBounds();

      const markers = found.map(({ pin, position }) => {
        const marker = new google.maps.Marker({ map, position, title: pin.label });
        marker.addListener("click", () => {
          infoWindow.setContent(
            `<div style="font-size:14px;font-weight:600;">${pin.label}</div>` +
              (pin.count > 1
                ? `<div style="font-size:12px;color:#555;">${pin.count} providers at this address</div>`
                : ""),
          );
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
    });

    return () => {
      cancelled = true;
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
