import type { NutritionCategory } from "./types";

/** Hub operator logins — password for all (demo): `123456` */
export const HUB_OPERATOR_PASSWORD = "123456";

export const HUB_OPERATOR_ACCOUNTS: { email: string; warehouseId: string }[] = [
  { email: "hub1@example.com", warehouseId: "wh-north" },
  { email: "hub2@example.com", warehouseId: "wh-river" },
  { email: "hub3@example.com", warehouseId: "wh-east" },
];

/** Cost per unit added to shelf (demo dollars). */
export const RESTOCK_COST_PER_UNIT: Record<NutritionCategory, number> = {
  protein: 8,
  carbs: 3,
  fiber: 4,
  produce: 6,
  hydration: 2,
};

export const INITIAL_HUB_FUNDING_PER_WAREHOUSE = 7500;
