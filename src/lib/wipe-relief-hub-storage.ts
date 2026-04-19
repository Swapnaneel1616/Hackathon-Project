/**
 * Clears all ReliefConnect / relief-hub demo persistence in the browser.
 * The app has no separate server DB for this hackathon build — state lives in localStorage.
 */
export function wipeReliefHubBrowserStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const knownLocal = [
      "relief-hub-state-v3",
      "relief-hub-state-v2",
      "relief-hub-state-v1",
      "relief-hub-accounts-v1",
    ];
    for (const k of knownLocal) {
      window.localStorage.removeItem(k);
    }
    const extraLs: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;
      if (
        k.startsWith("relief-hub") ||
        k.startsWith("reliefHub") ||
        k.startsWith("reliefgrid") ||
        k.startsWith("reliefconnect")
      ) {
        extraLs.push(k);
      }
    }
    for (const k of extraLs) {
      window.localStorage.removeItem(k);
    }

    const extraSs: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (!k) continue;
      if (
        k.startsWith("reliefHub") ||
        k.startsWith("relief-hub") ||
        k.startsWith("reliefgrid") ||
        k.startsWith("reliefconnect")
      ) {
        extraSs.push(k);
      }
    }
    for (const k of extraSs) {
      window.sessionStorage.removeItem(k);
    }
  } catch {
    /* private mode / quota */
  }
}
