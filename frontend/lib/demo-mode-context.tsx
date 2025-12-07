"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface DemoModeContextType {
  isDemoMode: boolean;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  toggleDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const enableDemoMode = () => setIsDemoMode(true);
  const disableDemoMode = () => setIsDemoMode(false);
  const toggleDemoMode = () => setIsDemoMode((prev) => !prev);

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        enableDemoMode,
        disableDemoMode,
        toggleDemoMode,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoModeProvider");
  }
  return context;
}
