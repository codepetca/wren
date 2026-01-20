"use client";

import { createContext, useContext } from "react";
import type { Map } from "maplibre-gl";

interface MapContextValue {
  map: Map | null;
}

export const MapContext = createContext<MapContextValue>({ map: null });

export function useMapLibre() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapLibre must be used within a MapProvider");
  }
  return context.map;
}
