"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "scurry_visitor_id";

// Fallback for older browsers without crypto.randomUUID
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return generateUUID();
  }
  // Fallback using crypto.getRandomValues
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c === "x" ? 0 : 3);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function useVisitorId() {
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    setVisitorId(id);
  }, []);

  const resetVisitorId = () => {
    const newId = generateUUID();
    localStorage.setItem(STORAGE_KEY, newId);
    setVisitorId(newId);
    return newId;
  };

  return { visitorId, resetVisitorId };
}
