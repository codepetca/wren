"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

interface PinProps {
  lat: number;
  lng: number;
  isCompleted: boolean;
  photoUrl?: string;
  onClick: () => void;
}

// Custom icon for blank pin
const blankIcon = L.divIcon({
  className: "custom-pin",
  html: `<div class="w-10 h-10 bg-gray-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
    <span class="text-white text-lg">?</span>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Custom icon for completed pin with photo
function createCompletedIcon(photoUrl: string) {
  return L.divIcon({
    className: "custom-pin",
    html: `<div class="w-12 h-12 rounded-full border-4 border-green-500 shadow-lg overflow-hidden">
      <img src="${photoUrl}" class="w-full h-full object-cover" alt="completed" />
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
}

export function Pin({ lat, lng, isCompleted, photoUrl, onClick }: PinProps) {
  const [icon, setIcon] = useState(blankIcon);

  useEffect(() => {
    if (isCompleted && photoUrl) {
      setIcon(createCompletedIcon(photoUrl));
    } else {
      setIcon(blankIcon);
    }
  }, [isCompleted, photoUrl]);

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      eventHandlers={{
        click: onClick,
      }}
    />
  );
}
