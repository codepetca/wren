"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "scurry_visitor_id";

export function useVisitorId() {
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    setVisitorId(id);
  }, []);

  const resetVisitorId = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, newId);
    setVisitorId(newId);
    return newId;
  };

  return { visitorId, resetVisitorId };
}
