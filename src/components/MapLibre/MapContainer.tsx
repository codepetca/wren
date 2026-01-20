"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import type { Bounds } from "@/../lib/types";
import { MapContext } from "./MapContext";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapProps {
  bounds: Bounds;
  children?: React.ReactNode;
}

// Register PMTiles protocol once
let protocolRegistered = false;

export function Map({ bounds, children }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Register PMTiles protocol
    if (!protocolRegistered) {
      const protocol = new Protocol();
      maplibregl.addProtocol("pmtiles", protocol.tile);
      protocolRegistered = true;
    }

    // Calculate center from bounds
    const center: [number, number] = [
      (bounds.east + bounds.west) / 2,
      (bounds.north + bounds.south) / 2,
    ];

    // Initialize map with simple raster tiles for now
    // Will switch to Protomaps vector tiles with custom style in Phase 2
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center,
      zoom: 13,
    });

    // Disable zoom controls for cleaner mobile UX
    map.scrollZoom.disable();
    map.boxZoom.disable();
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    // Fit to bounds when loaded
    map.on("load", () => {
      map.fitBounds(
        [
          [bounds.west, bounds.south],
          [bounds.east, bounds.north],
        ],
        { padding: 40 }
      );
      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [bounds]);

  // Update bounds when they change
  useEffect(() => {
    if (mapRef.current && mapReady) {
      mapRef.current.fitBounds(
        [
          [bounds.west, bounds.south],
          [bounds.east, bounds.north],
        ],
        { padding: 40 }
      );
    }
  }, [bounds, mapReady]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {mapReady && (
        <MapContext.Provider value={{ map: mapRef.current }}>
          {children}
        </MapContext.Provider>
      )}
    </div>
  );
}
