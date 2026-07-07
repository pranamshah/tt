"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/** True once mounted on the client; false during SSR to avoid hydration mismatches. */
export function useHasMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
