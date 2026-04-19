export type NutritionCategory =
  | "protein"
  | "carbs"
  | "fiber"
  | "produce"
  | "hydration";

export type StockLevel = "green" | "yellow" | "red";

export type DisasterPhase = "watch_pre" | "watch_critical" | "during" | "post";

export type ReservationStatus = "active" | "fulfilled" | "expired";

export type TicketStatus = "pending" | "accepted" | "closed" | "expired" | "rejected";

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  /** Government / fixed site */
  isGovernmentSite: boolean;
  categoryCaps: Record<NutritionCategory, number>;
  categoryStock: Record<NutritionCategory, number>;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: NutritionCategory;
  /** Display only — static balanced basket */
  description: string;
}

export interface Reservation {
  id: string;
  warehouseId: string;
  warehouseName: string;
  lines: { itemId: string; name: string; category: NutritionCategory; qty: number }[];
  /** Who placed the hold (demo local auth). */
  residentEmail?: string;
  /** @deprecated No pickup scheduling — holds are time-boxed from registration only */
  pickupSlotLabel?: string;
  createdAt: number;
  expiresAt: number;
  status: ReservationStatus;
}

export interface DonationTicket {
  id: string;
  warehouseId: string;
  warehouseName: string;
  lines: { itemId: string; name: string; category: NutritionCategory; qty: number }[];
  expectedPoints: number;
  status: TicketStatus;
  createdAt: number;
  expiresAt: number;
  donorEmail: string;
  donorDisplayName: string;
}

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  householdSize: number;
  points: number;
}

export interface ShelterNode {
  id: string;
  name: string;
  warehouseId: string;
  address: string;
  estimatedMeals: number;
  headcount: number;
  /** Rated site capacity (persons); shown only in unlock window. */
  ratedCapacity: number;
  /** Cots, kits, space (unlock window). */
  capacityNote: string;
}

export type FundingRequestStatus = "pending" | "approved" | "rejected";

/** Hub asks master admin for more operating funds. */
export interface FundingRequest {
  id: string;
  warehouseId: string;
  warehouseName: string;
  hubEmail: string;
  amount: number;
  message: string;
  status: FundingRequestStatus;
  createdAt: number;
  resolvedAt?: number;
  grantAmount?: number;
}

export type HubLedgerKind = "restock" | "grant";

export interface HubLedgerEntry {
  id: string;
  warehouseId: string;
  kind: HubLedgerKind;
  /** Negative = spend on restock, positive = master grant */
  amount: number;
  note: string;
  at: number;
}

export interface HubSession {
  email: string;
  warehouseId: string;
}

export const REDEEM_COST: Record<StockLevel, number> = {
  red: 25,
  yellow: 15,
  green: 10,
};

export const DONATION_POINTS_BASE: Record<StockLevel, number> = {
  red: 18,
  yellow: 12,
  green: 6,
};
