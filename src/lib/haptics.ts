/**
 * iOS-safe haptic feedback - best-effort with graceful fallback
 */

export type HapticType = "light" | "medium" | "heavy" | "success" | "warning" | "error";

let supportsHaptics = false;
let vibrateFn: ((pattern: number | number[]) => boolean) | null = null;

if (typeof navigator !== "undefined" && typeof window !== "undefined") {
  if ("vibrate" in navigator) {
    vibrateFn = navigator.vibrate.bind(navigator);
    supportsHaptics = true;
  }
  // @ts-expect-error - iOS Haptic Engine
  if (window.AudioContext || window.webkitAudioContext) {
    supportsHaptics = true;
  }
}

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 5,
  medium: 10,
  heavy: 20,
  success: [5, 50, 5],
  warning: [10, 30, 10],
  error: [20, 50, 20, 50, 20],
};

export function triggerHaptic(type: HapticType = "light"): void {
  try {
    const pattern = HAPTIC_PATTERNS[type];
    if (vibrateFn && pattern !== undefined) {
      vibrateFn(pattern);
    }
  } catch {
    // Graceful degradation - ignore unsupported APIs
  }
}

export function supportsHapticFeedback(): boolean {
  return supportsHaptics;
}
