import { useState, useCallback } from "react";

/**
 * Custom hook to manage app mode ("real" | "demo").
 * Persists to localStorage so it survives page refreshes.
 */
export function useAppMode() {
  const [mode, setModeState] = useState(() => localStorage.getItem("mode") || "real");

  const setMode = useCallback((newMode) => {
    localStorage.setItem("mode", newMode);
    setModeState(newMode);
  }, []);

  const isDemo = mode === "demo";

  const enterDemo = useCallback(() => {
    localStorage.setItem("mode", "demo");
    localStorage.setItem("token", "demo-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ name: "Demo User", userId: "demo-001", age: 65 })
    );
    setModeState("demo");
  }, []);

  const exitDemo = useCallback(() => {
    localStorage.removeItem("mode");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setModeState("real");
  }, []);

  return { mode, isDemo, setMode, enterDemo, exitDemo };
}

/**
 * Utility — get current mode without hook (for non-component code).
 */
export function getAppMode() {
  return localStorage.getItem("mode") || "real";
}

export function isDemoMode() {
  return getAppMode() === "demo";
}
