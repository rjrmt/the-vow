"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import {
  moduleControllerReducer,
  initialModuleState,
  type ModuleId,
} from "@/reducers/moduleController";

type ModuleContextValue = {
  current: ModuleId;
  navigate: (id: ModuleId) => void;
  back: () => void;
  reset: () => void;
};

const ModuleContext = createContext<ModuleContextValue | null>(null);

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(moduleControllerReducer, initialModuleState);

  const navigate = useCallback((id: ModuleId) => {
    dispatch({ type: "NAVIGATE", payload: id });
  }, []);

  const back = useCallback(() => {
    dispatch({ type: "BACK" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return (
    <ModuleContext.Provider
      value={{
        current: state.current,
        navigate,
        back,
        reset,
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
}

export function useModuleController() {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error("useModuleController must be used within ModuleProvider");
  return ctx;
}
