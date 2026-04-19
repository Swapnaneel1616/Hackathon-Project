import type { DisasterPhase } from "./types";

/** Hours-to-impact at or below this threshold unlocks live shelter intel for residents. */
export const SHELTER_INTEL_UNLOCK_HOURS = 24;

export function isShelterIntelUnlocked(hoursToImpact: number): boolean {
  return Number.isFinite(hoursToImpact) && hoursToImpact <= SHELTER_INTEL_UNLOCK_HOURS;
}

/**
 * Hub warehouse basket reservations are suspended during disaster coordination so
 * stock routes to shelter spokes instead of new resident self-serve holds.
 */
export function isHubReservationIntakeClosed(
  phase: DisasterPhase,
  hoursToImpact: number,
): boolean {
  if (phase === "during") return true;
  // Close only when impact is less than 24 hours away (not before).
  return Number.isFinite(hoursToImpact) && hoursToImpact < SHELTER_INTEL_UNLOCK_HOURS;
}
