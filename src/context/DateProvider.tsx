"use client";

import React, { createContext, useContext, useMemo } from "react";

interface DateContextValue {
  now: Date;
  /** ISO date string for today (YYYY-MM-DD) */
  today: string;
}

const DateContext = createContext<DateContextValue | null>(null);

export function DateProvider({
  children,
  initialDate,
}: {
  children: React.ReactNode;
  initialDate?: Date;
}) {
  const now = initialDate ?? new Date();
  const today = useMemo(() => now.toISOString().slice(0, 10), [now]);

  const value = useMemo(
    () => ({ now, today }),
    [now, today]
  );

  return (
    <DateContext.Provider value={value}>
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const ctx = useContext(DateContext);
  if (!ctx) throw new Error("useDate must be used within DateProvider");
  return ctx;
}
