"use client";

import { useLayoutEffect, useState } from "react";
import { ReliefGridShieldLogo } from "@/components/brand/reliefgrid-shield-logo";

const INTRO_SESSION_KEY = "reliefgrid_intro_shown_session";

const INTRO_MS = 3200;

export function LandingWithIntro({ children }: { children: React.ReactNode }) {
  const [showOverlay, setShowOverlay] = useState(true);

  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(INTRO_SESSION_KEY) === "1") {
        setShowOverlay(false);
        return;
      }
    } catch {
      setShowOverlay(false);
      return;
    }

    const end = window.setTimeout(() => {
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      setShowOverlay(false);
    }, INTRO_MS);

    return () => window.clearTimeout(end);
  }, []);

  return (
    <>
      {children}
      {showOverlay && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--grain-white)] px-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(44,69,112,0.32) 3px, rgba(44,69,112,0.32) 4px)`,
            }}
          />

          <div className="relative flex flex-col items-center">
            <div className="relative h-[min(52vw,220px)] w-[min(52vw,220px)] sm:h-56 sm:w-56">
              <div className="rg-intro-shield-half rg-intro-shield-half--left absolute inset-y-0 left-0 w-1/2 overflow-hidden">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <ReliefGridShieldLogo className="h-[min(52vw,220px)] w-[min(52vw,220px)] sm:h-56 sm:w-56" />
                </div>
              </div>
              <div className="rg-intro-shield-half rg-intro-shield-half--right absolute inset-y-0 right-0 w-1/2 overflow-hidden">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <ReliefGridShieldLogo className="h-[min(52vw,220px)] w-[min(52vw,220px)] sm:h-56 sm:w-56" />
                </div>
              </div>
            </div>

            <div className="rg-intro-wordmark mt-10 text-center">
              <p className="font-serif text-[clamp(2rem,7vw,3rem)] font-bold leading-none tracking-tight text-[var(--earth-dark)]">
                RELIEF
              </p>
              <p className="mt-2 font-serif text-[clamp(1.1rem,3.8vw,1.5rem)] font-semibold tracking-[0.42em] text-[#4978bc]">
                GRID
              </p>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--caption-muted)]">
                Disaster food · Precaution &amp; reserves
              </p>
            </div>

            <p className="rg-intro-lets-begin mt-14 text-center text-lg font-semibold tracking-wide text-[var(--reserve-green)]">
              Let&apos;s begin
            </p>
          </div>
        </div>
      )}
    </>
  );
}
