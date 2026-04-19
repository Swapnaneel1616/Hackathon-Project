"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ALLOTMENT_PER_HOUSEHOLD,
  WAREHOUSES as SEED_WAREHOUSES,
} from "@/lib/mock-data";
import { getAccount, saveAccount } from "@/lib/accounts-storage";
import { levelForCategory, sortWarehousesByUrgency } from "@/lib/stock-utils";
import type {
  CatalogItem,
  DisasterPhase,
  DonationTicket,
  NutritionCategory,
  Reservation,
  TicketStatus,
  UserProfile,
  Warehouse,
} from "@/lib/types";
import { DONATION_POINTS_BASE } from "@/lib/types";

const ADMIN_EMAIL = "admin@warehouse.com";
const ADMIN_PASSWORD = "123456";

const EXPIRY_POLL_MS = 15_000;
const STORAGE_KEY = "relief-hub-state-v2";

function cloneWarehouses(): Warehouse[] {
  return SEED_WAREHOUSES.map((w) => ({
    ...w,
    categoryCaps: { ...w.categoryCaps },
    categoryStock: { ...w.categoryStock },
  }));
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function isLegacyUser(u: unknown): u is { phone: string; householdSize: number; points: number } {
  return (
    typeof u === "object" &&
    u !== null &&
    "phone" in u &&
    !("email" in u)
  );
}

function migrateUser(u: unknown): UserProfile | null {
  if (!u || typeof u !== "object") return null;
  if ("email" in u && typeof (u as UserProfile).email === "string") {
    return u as UserProfile;
  }
  if (isLegacyUser(u)) {
    return {
      email: `legacy_${String(u.phone).replace(/\W/g, "")}@reliefgrid.demo`,
      firstName: "Community",
      lastName: "Member",
      phone: u.phone,
      addressLine: "—",
      city: "—",
      state: "—",
      postalCode: "—",
      householdSize: u.householdSize,
      points: u.points ?? 0,
    };
  }
  return null;
}

type ReliefContextValue = {
  user: UserProfile | null;
  adminSession: boolean;
  warehouses: Warehouse[];
  sortedWarehouses: Warehouse[];
  phase: DisasterPhase;
  hoursToImpact: number;
  reservations: Reservation[];
  tickets: DonationTicket[];
  bonusRedeemedThisVisit: boolean;
  creditLedger: Record<string, number>;
  registerUser: (input: {
    email: string;
    password: string;
    profile: Omit<UserProfile, "email" | "points">;
  }) => { ok: true } | { ok: false; reason: string };
  loginUser: (email: string, password: string) => { ok: true } | { ok: false; reason: string };
  logoutUser: () => void;
  loginAdmin: (email: string, password: string) => { ok: true } | { ok: false; reason: string };
  logoutAdmin: () => void;
  setPhase: (p: DisasterPhase) => void;
  setHoursToImpact: (h: number) => void;
  createReservation: (input: {
    warehouseId: string;
    lines: { item: CatalogItem; qty: number }[];
    holdHours: number;
  }) => { ok: true } | { ok: false; reason: string };
  fulfillReservation: (id: string) => void;
  expireReservation: (id: string) => void;
  createDonationTicket: (input: {
    warehouseId: string;
    lines: { item: CatalogItem; qty: number }[];
  }) => void;
  setTicketStatus: (id: string, status: TicketStatus) => void;
  redeemBonusItem: (input: {
    warehouseId: string;
    category: NutritionCategory;
  }) => { ok: true } | { ok: false; reason: string };
  resetBonusVisitFlag: () => void;
  startWarehouseVisit: () => void;
  resetDemo: () => void;
  updateWarehouseStock: (
    warehouseId: string,
    next: Partial<Record<NutritionCategory, number>>,
  ) => void;
};

const ReliefContext = createContext<ReliefContextValue | null>(null);

export function ReliefProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adminSession, setAdminSession] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(cloneWarehouses);
  const [phase, setPhaseState] = useState<DisasterPhase>("watch_pre");
  const [hoursToImpact, setHoursToImpact] = useState(144);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tickets, setTickets] = useState<DonationTicket[]>([]);
  const [bonusRedeemedThisVisit, setBonusRedeemedThisVisit] = useState(false);
  const [creditLedger, setCreditLedger] = useState<Record<string, number>>({});
  const userRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        user?: unknown;
        adminSession?: boolean;
        warehouses?: Warehouse[];
        phase?: DisasterPhase;
        hoursToImpact?: number;
        reservations?: Reservation[];
        tickets?: DonationTicket[];
        creditLedger?: Record<string, number>;
      };
      const mu = parsed.user ? migrateUser(parsed.user) : null;
      if (mu) setUser(mu);
      if (parsed.adminSession) setAdminSession(true);
      if (parsed.warehouses?.length) setWarehouses(parsed.warehouses);
      if (parsed.phase) setPhaseState(parsed.phase);
      if (typeof parsed.hoursToImpact === "number")
        setHoursToImpact(parsed.hoursToImpact);
      if (parsed.reservations) setReservations(parsed.reservations);
      if (parsed.tickets) {
        setTickets(
          parsed.tickets.map((t) =>
            t.donorEmail
              ? t
              : {
                  ...t,
                  donorEmail: "unknown@reliefgrid.demo",
                  donorDisplayName: "Unknown donor",
                },
          ),
        );
      }
      if (parsed.creditLedger) setCreditLedger(parsed.creditLedger);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const payload = {
      user,
      adminSession,
      warehouses,
      phase,
      hoursToImpact,
      reservations,
      tickets,
      creditLedger,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    user,
    adminSession,
    warehouses,
    phase,
    hoursToImpact,
    reservations,
    tickets,
    creditLedger,
  ]);

  const sortedWarehouses = useMemo(
    () => sortWarehousesByUrgency(warehouses),
    [warehouses],
  );

  const registerUser = useCallback(
    (input: {
      email: string;
      password: string;
      profile: Omit<UserProfile, "email" | "points">;
    }): { ok: true } | { ok: false; reason: string } => {
      const email = input.email.trim().toLowerCase();
      if (!email || !input.password) {
        return { ok: false, reason: "Email and password are required." };
      }
      if (getAccount(email)) {
        return { ok: false, reason: "An account with this email already exists." };
      }
      saveAccount({
        email,
        password: input.password,
        profile: input.profile,
      });
      setAdminSession(false);
      setCreditLedger((ledger) => {
        const bonus = ledger[email] || 0;
        const { [email]: consumed, ...rest } = ledger;
        void consumed;
        setUser({
          email,
          points: bonus,
          ...input.profile,
        });
        return rest;
      });
      return { ok: true };
    },
    [],
  );

  const loginUser = useCallback(
    (email: string, password: string): { ok: true } | { ok: false; reason: string } => {
      const key = email.trim().toLowerCase();
      const acc = getAccount(key);
      if (!acc || acc.password !== password) {
        return { ok: false, reason: "Invalid email or password." };
      }
      setAdminSession(false);
      setCreditLedger((ledger) => {
        const bonus = ledger[key] || 0;
        const { [key]: consumedKey, ...rest } = ledger;
        void consumedKey;
        setUser({
          email: key,
          points: bonus,
          ...acc.profile,
        });
        return rest;
      });
      return { ok: true };
    },
    [],
  );

  const logoutUser = useCallback(() => {
    setUser(null);
  }, []);

  const loginAdmin = useCallback(
    (email: string, password: string): { ok: true } | { ok: false; reason: string } => {
      if (
        email.trim().toLowerCase() !== ADMIN_EMAIL ||
        password !== ADMIN_PASSWORD
      ) {
        return { ok: false, reason: "Invalid warehouse credentials." };
      }
      setUser(null);
      setAdminSession(true);
      return { ok: true };
    },
    [],
  );

  const logoutAdmin = useCallback(() => {
    setAdminSession(false);
  }, []);

  const setPhase = useCallback((p: DisasterPhase) => {
    setPhaseState(p);
  }, []);

  const applyStockDelta = useCallback(
    (warehouseId: string, deltas: Partial<Record<NutritionCategory, number>>) => {
      setWarehouses((prev) =>
        prev.map((w) => {
          if (w.id !== warehouseId) return w;
          const next = { ...w, categoryStock: { ...w.categoryStock } };
          (Object.keys(deltas) as NutritionCategory[]).forEach((c) => {
            const d = deltas[c];
            if (d == null) return;
            next.categoryStock[c] = Math.max(
              0,
              Math.min(next.categoryCaps[c], next.categoryStock[c] + d),
            );
          });
          return next;
        }),
      );
    },
    [],
  );

  const updateWarehouseStock = useCallback(
    (warehouseId: string, next: Partial<Record<NutritionCategory, number>>) => {
      setWarehouses((prev) =>
        prev.map((w) => {
          if (w.id !== warehouseId) return w;
          const ns = { ...w.categoryStock };
          (Object.keys(next) as NutritionCategory[]).forEach((c) => {
            const v = next[c];
            if (v == null || Number.isNaN(v)) return;
            ns[c] = Math.max(0, Math.min(w.categoryCaps[c], Math.floor(v)));
          });
          return { ...w, categoryStock: ns };
        }),
      );
    },
    [],
  );

  const createReservation = useCallback(
    (input: {
      warehouseId: string;
      lines: { item: CatalogItem; qty: number }[];
      holdHours: number;
    }): { ok: true } | { ok: false; reason: string } => {
      if (!user) return { ok: false, reason: "Sign in required." };
      const w = warehouses.find((x) => x.id === input.warehouseId);
      if (!w) return { ok: false, reason: "Warehouse not found." };

      const limits: Record<NutritionCategory, number> = {
        protein: 0,
        carbs: 0,
        fiber: 0,
        produce: 0,
        hydration: 0,
      };
      (Object.keys(limits) as NutritionCategory[]).forEach((c) => {
        limits[c] = ALLOTMENT_PER_HOUSEHOLD[c] * user.householdSize;
      });

      const used: Record<NutritionCategory, number> = {
        protein: 0,
        carbs: 0,
        fiber: 0,
        produce: 0,
        hydration: 0,
      };
      for (const l of input.lines) {
        used[l.item.category] += l.qty;
      }
      for (const c of Object.keys(used) as NutritionCategory[]) {
        if (used[c] > limits[c]) {
          return {
            ok: false,
            reason: `Over allotment for ${c} (${used[c]} > ${limits[c]}).`,
          };
        }
      }

      for (const l of input.lines) {
        if (l.qty <= 0) continue;
        const avail = w.categoryStock[l.item.category];
        if (avail < l.qty) {
          return {
            ok: false,
            reason: `Not enough stock for ${l.item.name} (${l.item.category}).`,
          };
        }
      }

      const deltas: Partial<Record<NutritionCategory, number>> = {};
      for (const l of input.lines) {
        if (l.qty <= 0) continue;
        deltas[l.item.category] = (deltas[l.item.category] || 0) - l.qty;
      }
      applyStockDelta(w.id, deltas);

      const res: Reservation = {
        id: uid("res"),
        warehouseId: w.id,
        warehouseName: w.name,
        lines: input.lines
          .filter((l) => l.qty > 0)
          .map((l) => ({
            itemId: l.item.id,
            name: l.item.name,
            category: l.item.category,
            qty: l.qty,
          })),
        createdAt: Date.now(),
        expiresAt: Date.now() + input.holdHours * 3600_000,
        status: "active",
      };
      setReservations((r) => [res, ...r]);
      return { ok: true };
    },
    [applyStockDelta, user, warehouses],
  );

  const expireReservation = useCallback(
    (id: string) => {
      setReservations((prev) => {
        const r = prev.find((x) => x.id === id && x.status === "active");
        if (r) {
          const deltas: Partial<Record<NutritionCategory, number>> = {};
          for (const l of r.lines) {
            deltas[l.category] = (deltas[l.category] || 0) + l.qty;
          }
          queueMicrotask(() => applyStockDelta(r.warehouseId, deltas));
        }
        return prev.map((x) =>
          x.id === id && x.status === "active"
            ? { ...x, status: "expired" as const }
            : x,
        );
      });
    },
    [applyStockDelta],
  );

  const fulfillReservation = useCallback((id: string) => {
    setReservations((prev) =>
      prev.map((x) =>
        x.id === id && x.status === "active"
          ? { ...x, status: "fulfilled" as const }
          : x,
      ),
    );
  }, []);

  const expectedPointsForDonation = useCallback(
    (warehouseId: string, lines: { item: CatalogItem; qty: number }[]) => {
      const w = warehouses.find((x) => x.id === warehouseId);
      if (!w) return 0;
      let pts = 0;
      for (const l of lines) {
        if (l.qty <= 0) continue;
        const lvl = levelForCategory(w, l.item.category);
        pts += DONATION_POINTS_BASE[lvl] * l.qty;
      }
      return Math.round(pts);
    },
    [warehouses],
  );

  const createDonationTicket = useCallback(
    (input: { warehouseId: string; lines: { item: CatalogItem; qty: number }[] }) => {
      const w = warehouses.find((x) => x.id === input.warehouseId);
      if (!w || !user) return;
      const expected = expectedPointsForDonation(input.warehouseId, input.lines);
      const donorDisplayName = `${user.firstName} ${user.lastName}`.trim();
      const t: DonationTicket = {
        id: uid("tix"),
        warehouseId: w.id,
        warehouseName: w.name,
        lines: input.lines
          .filter((l) => l.qty > 0)
          .map((l) => ({
            itemId: l.item.id,
            name: l.item.name,
            category: l.item.category,
            qty: l.qty,
          })),
        expectedPoints: expected,
        status: "pending",
        createdAt: Date.now(),
        expiresAt: Date.now() + 12 * 3600_000,
        donorEmail: user.email.toLowerCase(),
        donorDisplayName,
      };
      setTickets((x) => [t, ...x]);
    },
    [expectedPointsForDonation, user, warehouses],
  );

  const setTicketStatus = useCallback(
    (id: string, status: TicketStatus) => {
      setTickets((prev) => {
        const t = prev.find((x) => x.id === id);
        if (!t) return prev;
        if (status === "closed" && t.status !== "closed") {
          const deltas: Partial<Record<NutritionCategory, number>> = {};
          for (const l of t.lines) {
            deltas[l.category] = (deltas[l.category] || 0) + l.qty;
          }
          applyStockDelta(t.warehouseId, deltas);
          const email = t.donorEmail.toLowerCase();
          const pts = t.expectedPoints;
          queueMicrotask(() => {
            const session = userRef.current;
            if (session?.email.toLowerCase() === email) {
              setUser((u) =>
                u && u.email.toLowerCase() === email
                  ? { ...u, points: u.points + pts }
                  : u,
              );
            } else {
              setCreditLedger((ledger) => ({
                ...ledger,
                [email]: (ledger[email] || 0) + pts,
              }));
            }
          });
        }
        return prev.map((x) => (x.id === id ? { ...x, status } : x));
      });
    },
    [applyStockDelta],
  );

  const redeemBonusItem = useCallback(
    (input: { warehouseId: string; category: NutritionCategory }) => {
      if (!user) return { ok: false as const, reason: "Sign in required." };
      if (bonusRedeemedThisVisit) {
        return {
          ok: false as const,
          reason: "Only one bonus item per warehouse visit (demo rule).",
        };
      }
      const w = warehouses.find((x) => x.id === input.warehouseId);
      if (!w) return { ok: false as const, reason: "Warehouse not found." };
      const lvl = levelForCategory(w, input.category);
      const cost = lvl === "red" ? 25 : lvl === "yellow" ? 15 : 10;
      if (user.points < cost) {
        return { ok: false as const, reason: `Need ${cost} points for this tier.` };
      }
      if (w.categoryStock[input.category] < 1) {
        return { ok: false as const, reason: "No stock in that category right now." };
      }
      setUser((u) => (u ? { ...u, points: u.points - cost } : u));
      applyStockDelta(w.id, { [input.category]: -1 });
      setBonusRedeemedThisVisit(true);
      return { ok: true as const };
    },
    [applyStockDelta, bonusRedeemedThisVisit, user, warehouses],
  );

  const resetBonusVisitFlag = useCallback(() => {
    setBonusRedeemedThisVisit(false);
  }, []);

  const startWarehouseVisit = useCallback(() => {
    setBonusRedeemedThisVisit(false);
  }, []);

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("relief-hub-accounts-v1");
    setWarehouses(cloneWarehouses());
    setPhaseState("watch_pre");
    setHoursToImpact(144);
    setReservations([]);
    setTickets([]);
    setBonusRedeemedThisVisit(false);
    setUser(null);
    setAdminSession(false);
    setCreditLedger({});
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setReservations((prev) => {
        let changed = false;
        const next = prev.map((r) => {
          if (r.status !== "active") return r;
          if (r.expiresAt <= now) {
            changed = true;
            const deltas: Partial<Record<NutritionCategory, number>> = {};
            for (const l of r.lines) {
              deltas[l.category] = (deltas[l.category] || 0) + l.qty;
            }
            queueMicrotask(() => applyStockDelta(r.warehouseId, deltas));
            return { ...r, status: "expired" as const };
          }
          return r;
        });
        return changed ? next : prev;
      });
      setTickets((prev) => {
        let changed = false;
        const next = prev.map((t) => {
          if (t.status !== "pending") return t;
          if (t.expiresAt <= now) {
            changed = true;
            return { ...t, status: "expired" as const };
          }
          return t;
        });
        return changed ? next : prev;
      });
    }, EXPIRY_POLL_MS);
    return () => window.clearInterval(id);
  }, [applyStockDelta]);

  const value = useMemo<ReliefContextValue>(
    () => ({
      user,
      adminSession,
      warehouses,
      sortedWarehouses,
      phase,
      hoursToImpact,
      reservations,
      tickets,
      bonusRedeemedThisVisit,
      creditLedger,
      registerUser,
      loginUser,
      logoutUser,
      loginAdmin,
      logoutAdmin,
      setPhase,
      setHoursToImpact,
      createReservation,
      fulfillReservation,
      expireReservation,
      createDonationTicket,
      setTicketStatus,
      redeemBonusItem,
      resetBonusVisitFlag,
      startWarehouseVisit,
      resetDemo,
      updateWarehouseStock,
    }),
    [
      user,
      adminSession,
      warehouses,
      sortedWarehouses,
      phase,
      hoursToImpact,
      reservations,
      tickets,
      bonusRedeemedThisVisit,
      creditLedger,
      registerUser,
      loginUser,
      logoutUser,
      loginAdmin,
      logoutAdmin,
      setPhase,
      setHoursToImpact,
      createReservation,
      fulfillReservation,
      expireReservation,
      createDonationTicket,
      setTicketStatus,
      redeemBonusItem,
      resetBonusVisitFlag,
      startWarehouseVisit,
      resetDemo,
      updateWarehouseStock,
    ],
  );

  return (
    <ReliefContext.Provider value={value}>{children}</ReliefContext.Provider>
  );
}

export function useRelief() {
  const ctx = useContext(ReliefContext);
  if (!ctx) throw new Error("useRelief must be used within ReliefProvider");
  return ctx;
}
