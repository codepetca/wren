"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { useMapLibre } from "./MapContext";

interface PinProps {
  lat: number;
  lng: number;
  isCompleted: boolean;
  photoUrl?: string;
  onClick: () => void;
}

export function Pin({ lat, lng, isCompleted, photoUrl, onClick }: PinProps) {
  const map = useMapLibre();
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create marker element
    const el = document.createElement("div");
    el.className = "maplibre-pin";
    elementRef.current = el;

    // Create marker
    const marker = new maplibregl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat([lng, lat])
      .addTo(map);

    markerRef.current = marker;

    // Add click handler
    el.addEventListener("click", onClick);

    return () => {
      el.removeEventListener("click", onClick);
      marker.remove();
      markerRef.current = null;
      elementRef.current = null;
    };
  }, [map, lat, lng, onClick]);

  // Update marker content when completion status changes
  useEffect(() => {
    if (!elementRef.current) return;

    if (isCompleted && photoUrl) {
      elementRef.current.innerHTML = `
        <div class="w-12 h-12 rounded-full border-4 border-green-500 shadow-lg overflow-hidden cursor-pointer transform -translate-y-1 hover:scale-110 transition-transform">
          <img src="${photoUrl}" class="w-full h-full object-cover" alt="completed" />
        </div>
      `;
    } else {
      elementRef.current.innerHTML = `
        <div class="w-10 h-10 bg-gray-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer transform -translate-y-1 hover:scale-110 transition-transform">
          <span class="text-white text-lg font-bold">?</span>
        </div>
      `;
    }
  }, [isCompleted, photoUrl]);

  return null;
}
