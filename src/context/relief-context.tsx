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
  CATEGORY_LABELS,
  WAREHOUSES as SEED_WAREHOUSES,
} from "@/lib/mock-data";
import { dailyLaneUsageFromReservations, localDateKey } from "@/lib/daily-lane-usage";
import { isHubReservationIntakeClosed } from "@/lib/shelter-gate";
import {
  HUB_OPERATOR_ACCOUNTS,
  HUB_OPERATOR_PASSWORD,
  INITIAL_HUB_FUNDING_PER_WAREHOUSE,
  RESTOCK_COST_PER_UNIT,
} from "@/lib/hub-accounts";
import { getAccount, saveAccount } from "@/lib/accounts-storage";
import { wipeReliefHubBrowserStorage } from "@/lib/wipe-relief-hub-storage";
import { levelForCategory, sortWarehousesByUrgency } from "@/lib/stock-utils";
import type {
  CatalogItem,
  DisasterPhase,
  DonationTicket,
  FundingRequest,
  HubLedgerEntry,
  HubSession,
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
const STORAGE_KEY = "relief-hub-state-v3";

function defaultHubFunds(): Record<string, number> {
  return Object.fromEntries(
    SEED_WAREHOUSES.map((w) => [w.id, INITIAL_HUB_FUNDING_PER_WAREHOUSE]),
  );
}

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
  }) => { ok: true } | { ok: false; reason: string };
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
  hubSession: HubSession | null;
  hubFunds: Record<string, number>;
  fundingRequests: FundingRequest[];
  hubLedger: HubLedgerEntry[];
  loginHub: (email: string, password: string) => { ok: true } | { ok: false; reason: string };
  logoutHub: () => void;
  purchaseHubStock: (
    warehouseId: string,
    category: NutritionCategory,
    units: number,
  ) => { ok: true; added: number; cost: number } | { ok: false; reason: string };
  submitFundingRequest: (
    warehouseId: string,
    amount: number,
    message: string,
  ) => { ok: true } | { ok: false; reason: string };
  resolveFundingRequest: (
    id: string,
    decision: "approved" | "rejected",
    grantAmount?: number,
  ) => { ok: true } | { ok: false; reason: string };
};

const ReliefContext = createContext<ReliefContextValue | null>(null);

export function ReliefProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adminSession, setAdminSession] = useState(false);
  const [hubSession, setHubSession] = useState<HubSession | null>(null);
  const [hubFunds, setHubFunds] = useState<Record<string, number>>(() => defaultHubFunds());
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [hubLedger, setHubLedger] = useState<HubLedgerEntry[]>([]);
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
        hubSession?: HubSession | null;
        hubFunds?: Record<string, number>;
        fundingRequests?: FundingRequest[];
        hubLedger?: HubLedgerEntry[];
        warehouses?: Warehouse[];
        phase?: DisasterPhase;
        hoursToImpact?: number;
        reservations?: Reservation[];
        tickets?: DonationTicket[];
        creditLedger?: Record<string, number>;
      };
      const mu = parsed.user ? migrateUser(parsed.user) : null;
      if (mu) {
        const key = mu.email.toLowerCase();
        const acc = getAccount(key);
        if (acc) {
          setUser({
            email: key,
            points: typeof mu.points === "number" ? mu.points : 0,
            ...acc.profile,
          });
        }
      }
      if (parsed.adminSession) setAdminSession(true);
      if (parsed.hubSession?.warehouseId && parsed.hubSession.email) {
        setHubSession(parsed.hubSession);
      }
      if (parsed.hubFunds && typeof parsed.hubFunds === "object") {
        setHubFunds((prev) => ({ ...prev, ...parsed.hubFunds }));
      }
      if (parsed.fundingRequests?.length) setFundingRequests(parsed.fundingRequests);
      if (parsed.hubLedger?.length) setHubLedger(parsed.hubLedger);
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
      hubSession,
      hubFunds,
      fundingRequests,
      hubLedger,
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
    hubSession,
    hubFunds,
    fundingRequests,
    hubLedger,
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
      setHubSession(null);
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
      if (!acc) {
        return {
          ok: false,
          reason: "No resident account for this email. Register before signing in.",
        };
      }
      if (acc.password !== password) {
        return { ok: false, reason: "Incorrect password." };
      }
      setAdminSession(false);
      setHubSession(null);
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
    setHubSession(null);
  }, []);

  const loginAdmin = useCallback(
    (email: string, password: string): { ok: true } | { ok: false; reason: string } => {
      if (
        email.trim().toLowerCase() !== ADMIN_EMAIL ||
        password !== ADMIN_PASSWORD
      ) {
        return { ok: false, reason: "Invalid master admin credentials." };
      }
      setUser(null);
      setHubSession(null);
      setAdminSession(true);
      return { ok: true };
    },
    [],
  );

  const logoutAdmin = useCallback(() => {
    setAdminSession(false);
  }, []);

  const loginHub = useCallback(
    (email: string, password: string): { ok: true } | { ok: false; reason: string } => {
      if (password !== HUB_OPERATOR_PASSWORD) {
        return { ok: false, reason: "Invalid email or password." };
      }
      const key = email.trim().toLowerCase();
      const row = HUB_OPERATOR_ACCOUNTS.find((a) => a.email.toLowerCase() === key);
      if (!row) {
        return { ok: false, reason: "Use hub1@example.com, hub2@example.com, or hub3@example.com." };
      }
      setUser(null);
      setAdminSession(false);
      setHubSession({ email: key, warehouseId: row.warehouseId });
      return { ok: true };
    },
    [],
  );

  const logoutHub = useCallback(() => {
    setHubSession(null);
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
      if (isHubReservationIntakeClosed(phase, hoursToImpact)) {
        return {
          ok: false,
          reason:
            "This hub is closed for new reservations while disaster coordination is active. Stock is being routed to official shelter sites — use the Shelter tab for locations and guidance.",
        };
      }

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

      const todayKey = localDateKey();
      const emailLower = user.email.toLowerCase();
      const dailyUsed = dailyLaneUsageFromReservations(
        reservations,
        emailLower,
        todayKey,
      );
      for (const c of Object.keys(used) as NutritionCategory[]) {
        if (used[c] <= 0) continue;
        const totalToday = dailyUsed[c] + used[c];
        if (totalToday > limits[c]) {
          const label = CATEGORY_LABELS[c] ?? c;
          return {
            ok: false,
            reason: `Daily ${label} limit for your household is ${limits[c]}. You already have ${dailyUsed[c]} units reserved or picked up today; this basket would add ${used[c]}. Remove some ${label} or try again tomorrow.`,
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
        residentEmail: user.email.toLowerCase(),
        createdAt: Date.now(),
        expiresAt: Date.now() + input.holdHours * 3600_000,
        status: "active",
      };
      setReservations((r) => [res, ...r]);
      return { ok: true };
    },
    [applyStockDelta, hoursToImpact, phase, reservations, user, warehouses],
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
      if (!w || !user) return { ok: false as const, reason: "Sign in required." };

      const filtered = input.lines.filter((l) => l.qty > 0);
      if (!filtered.length) return { ok: false as const, reason: "Add at least one donation line." };

      const disallowed = Array.from(
        new Set(
          filtered
            .map((l) => l.item.category)
            .filter((c) => levelForCategory(w, c) === "green"),
        ),
      );
      if (disallowed.length > 0) {
        const names = disallowed.map((c) => CATEGORY_LABELS[c] ?? c).join(", ");
        return {
          ok: false as const,
          reason: `Thank you — ${w.name} is already full for ${names}. Please try the next hub for lanes that are low (yellow/red).`,
        };
      }
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
      return { ok: true as const };
    },
    [expectedPointsForDonation, user, warehouses],
  );

  const setTicketStatus = useCallback(
    (id: string, status: TicketStatus) => {
      setTickets((prev) => {
        const t = prev.find((x) => x.id === id);
        if (!t) return prev;
        if (hubSession && t.warehouseId !== hubSession.warehouseId) {
          return prev;
        }
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
    [applyStockDelta, hubSession],
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

  const purchaseHubStock = useCallback(
    (
      warehouseId: string,
      category: NutritionCategory,
      units: number,
    ):
      | { ok: true; added: number; cost: number }
      | { ok: false; reason: string } => {
      if (!hubSession || hubSession.warehouseId !== warehouseId) {
        return { ok: false, reason: "Sign in as this hub to purchase stock." };
      }
      if (!Number.isFinite(units) || units <= 0 || !Number.isInteger(units)) {
        return { ok: false, reason: "Enter a positive whole number of units." };
      }
      const w = warehouses.find((x) => x.id === warehouseId);
      if (!w) return { ok: false, reason: "Hub not found." };
      const room = w.categoryCaps[category] - w.categoryStock[category];
      if (room <= 0) {
        return { ok: false, reason: "This lane is already at shelf capacity." };
      }
      const add = Math.min(units, room);
      const unitCost = RESTOCK_COST_PER_UNIT[category];
      const cost = unitCost * add;
      const balance = hubFunds[warehouseId] ?? 0;
      if (balance < cost) {
        return {
          ok: false,
          reason: `Need $${cost} for ${add} units (have $${balance}). Request funds from master admin.`,
        };
      }
      setHubFunds((prev) => ({
        ...prev,
        [warehouseId]: (prev[warehouseId] ?? 0) - cost,
      }));
      applyStockDelta(warehouseId, { [category]: add });
      const entry: HubLedgerEntry = {
        id: uid("led"),
        warehouseId,
        kind: "restock",
        amount: -cost,
        note: `Restock +${add} ${category} @ $${unitCost}/u`,
        at: Date.now(),
      };
      setHubLedger((prev) => [entry, ...prev]);
      return { ok: true, added: add, cost };
    },
    [applyStockDelta, hubFunds, hubSession, warehouses],
  );

  const submitFundingRequest = useCallback(
    (
      warehouseId: string,
      amount: number,
      message: string,
    ): { ok: true } | { ok: false; reason: string } => {
      if (!hubSession || hubSession.warehouseId !== warehouseId) {
        return { ok: false, reason: "Sign in as this hub to submit a request." };
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, reason: "Enter a positive dollar amount." };
      }
      const w = warehouses.find((x) => x.id === warehouseId);
      if (!w) return { ok: false, reason: "Hub not found." };
      const req: FundingRequest = {
        id: uid("fund"),
        warehouseId,
        warehouseName: w.name,
        hubEmail: hubSession.email,
        amount: Math.round(amount),
        message: message.trim() || "—",
        status: "pending",
        createdAt: Date.now(),
      };
      setFundingRequests((prev) => [req, ...prev]);
      return { ok: true };
    },
    [hubSession, warehouses],
  );

  const resolveFundingRequest = useCallback(
    (
      id: string,
      decision: "approved" | "rejected",
      grantAmount?: number,
    ): { ok: true } | { ok: false; reason: string } => {
      if (!adminSession) {
        return { ok: false, reason: "Only the master admin can resolve funding requests." };
      }
      const req = fundingRequests.find((r) => r.id === id && r.status === "pending");
      if (!req) return { ok: false, reason: "Request not found or already resolved." };
      const now = Date.now();
      if (decision === "rejected") {
        setFundingRequests((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: "rejected" as const, resolvedAt: now } : r,
          ),
        );
        return { ok: true };
      }
      const grant = Math.max(
        0,
        Math.round(grantAmount ?? req.amount),
      );
      setFundingRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "approved" as const,
                resolvedAt: now,
                grantAmount: grant,
              }
            : r,
        ),
      );
      if (grant > 0) {
        setHubFunds((prev) => ({
          ...prev,
          [req.warehouseId]: (prev[req.warehouseId] ?? 0) + grant,
        }));
        const entry: HubLedgerEntry = {
          id: uid("led"),
          warehouseId: req.warehouseId,
          kind: "grant",
          amount: grant,
          note: `Master admin approved funding request ${id}`,
          at: now,
        };
        setHubLedger((prev) => [entry, ...prev]);
      }
      return { ok: true };
    },
    [adminSession, fundingRequests],
  );

  const resetDemo = useCallback(() => {
    wipeReliefHubBrowserStorage();
    setWarehouses(cloneWarehouses());
    setPhaseState("watch_pre");
    setHoursToImpact(144);
    setReservations([]);
    setTickets([]);
    setBonusRedeemedThisVisit(false);
    setUser(null);
    setAdminSession(false);
    setHubSession(null);
    setHubFunds(defaultHubFunds());
    setFundingRequests([]);
    setHubLedger([]);
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
      hubSession,
      hubFunds,
      fundingRequests,
      hubLedger,
      registerUser,
      loginUser,
      logoutUser,
      loginAdmin,
      logoutAdmin,
      loginHub,
      logoutHub,
      purchaseHubStock,
      submitFundingRequest,
      resolveFundingRequest,
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
      hubSession,
      hubFunds,
      fundingRequests,
      hubLedger,
      registerUser,
      loginUser,
      logoutUser,
      loginAdmin,
      logoutAdmin,
      loginHub,
      logoutHub,
      purchaseHubStock,
      submitFundingRequest,
      resolveFundingRequest,
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
