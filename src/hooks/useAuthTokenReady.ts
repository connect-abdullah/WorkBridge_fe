"use client";

import { useEffect, useState } from "react";

/** Avoids SSR/localStorage mismatch: `null` until mounted. */
export function useAuthTokenReady(): boolean | null {
  const [ready, setReady] = useState<boolean | null>(null);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}
