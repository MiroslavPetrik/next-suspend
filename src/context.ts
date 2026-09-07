"use client";

import { createContext, use, useContext } from "react";

export const SuspendContext = createContext<Promise<unknown> | null>(null);

export function useSuspend() {
  const promise = useContext(SuspendContext);

  if (!promise) {
    throw new Error(
      "The useSuspend() must be used within a <SuspendContext.Provider>.",
    );
  }

  return use(promise);
}
