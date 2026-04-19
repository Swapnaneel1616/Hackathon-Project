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
