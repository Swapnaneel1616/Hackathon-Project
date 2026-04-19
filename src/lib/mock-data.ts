import type { CatalogItem, ShelterNode, Warehouse } from "./types";

export const CATEGORY_LABELS: Record<string, string> = {
  protein: "Protein",
  carbs: "Carbohydrates",
  fiber: "Fiber & grains",
  produce: "Produce",
  hydration: "Hydration",
};

export const WAREHOUSES: Warehouse[] = [
  {
    id: "wh-north",
    name: "North District Relief Hub",
    address: "1200 Civic Center Blvd, District 4",
    lat: 40.78,
    lng: -73.97,
    isGovernmentSite: true,
    categoryCaps: {
      protein: 800,
      carbs: 1200,
      fiber: 600,
      produce: 500,
      hydration: 900,
    },
    categoryStock: {
      protein: 120,
      carbs: 700,
      fiber: 400,
      produce: 90,
      hydration: 820,
    },
  },
  {
    id: "wh-river",
    name: "Riverside Community Warehouse",
    address: "88 Harbor Rd (Municipal depot)",
    lat: 40.75,
    lng: -73.99,
    isGovernmentSite: true,
    categoryCaps: {
      protein: 500,
      carbs: 900,
      fiber: 450,
      produce: 400,
      hydration: 600,
    },
    categoryStock: {
      protein: 380,
      carbs: 520,
      fiber: 300,
      produce: 260,
      hydration: 410,
    },
  },
  {
    id: "wh-east",
    name: "Eastside Stadium Annex",
    address: "1 Stadium Way (Gov lease)",
    lat: 40.73,
    lng: -73.93,
    isGovernmentSite: true,
    categoryCaps: {
      protein: 650,
      carbs: 1000,
      fiber: 500,
      produce: 550,
      hydration: 700,
    },
    categoryStock: {
      protein: 520,
      carbs: 780,
      fiber: 420,
      produce: 400,
      hydration: 590,
    },
  },
];

export const CATALOG: CatalogItem[] = [
  {
    id: "beans",
    name: "Fortified beans (pouch)",
    category: "protein",
    description: "Shelf-stable legume protein",
  },
  {
    id: "eggs",
    name: "Pasteurized egg mix",
    category: "protein",
    description: "Controlled-temp alternative where eggs unavailable",
  },
  {
    id: "eggs-tray",
    name: "Shell eggs (30ct tray)",
    category: "protein",
    description: "Short-shelf protein for families with refrigeration",
  },
  {
    id: "rice",
    name: "Parboiled rice (1kg)",
    category: "carbs",
    description: "Primary energy staple",
  },
  {
    id: "oats",
    name: "Rolled oats (800g)",
    category: "fiber",
    description: "Fiber-forward breakfast staple",
  },
  {
    id: "veg-mix",
    name: "Dehydrated veg mix",
    category: "produce",
    description: "Micronutrient-dense add-in",
  },
  {
    id: "water",
    name: "Drinking water (6L)",
    category: "hydration",
    description: "Hydration priority pack",
  },
];

/** Three shelter spokes per relief hub (demo registry). */
export const SHELTERS: ShelterNode[] = [
  {
    id: "sh-north-a",
    name: "Memorial Field — Hall A",
    warehouseId: "wh-north",
    address: "Memorial Field, Gate C (west)",
    estimatedMeals: 520,
    headcount: 240,
    ratedCapacity: 380,
    capacityNote: "Cots 300 · warming kits · triage lanes 1–3",
  },
  {
    id: "sh-north-b",
    name: "Civic Center — Banquet wing",
    warehouseId: "wh-north",
    address: "100 Civic Plaza, lower level",
    estimatedMeals: 480,
    headcount: 210,
    ratedCapacity: 350,
    capacityNote: "Meal line A/B · ADA bays · charging station",
  },
  {
    id: "sh-north-c",
    name: "North Gymnasium annex",
    warehouseId: "wh-north",
    address: "80 School Row, annex doors",
    estimatedMeals: 400,
    headcount: 170,
    ratedCapacity: 280,
    capacityNote: "Bleacher staging · youth corner · nurse desk",
  },
  {
    id: "sh-river-a",
    name: "Riverside HS — Main gym",
    warehouseId: "wh-river",
    address: "200 School Ln, gym entrance",
    estimatedMeals: 410,
    headcount: 180,
    ratedCapacity: 300,
    capacityNote: "Two hot lines · water bladder fill · pet crates",
  },
  {
    id: "sh-river-b",
    name: "Harbor community hall",
    warehouseId: "wh-river",
    address: "14 Harbor Rd, rear hall",
    estimatedMeals: 360,
    headcount: 150,
    ratedCapacity: 260,
    capacityNote: "Overnight mats · interpreter booth · infant care",
  },
  {
    id: "sh-river-c",
    name: "Riverside library basement",
    warehouseId: "wh-river",
    address: "55 Riverwalk, basement B",
    estimatedMeals: 210,
    headcount: 80,
    ratedCapacity: 140,
    capacityNote: "Quiet zone · device charging · overflow triage",
  },
  {
    id: "sh-east-a",
    name: "Eastside Arena — Hall 2",
    warehouseId: "wh-east",
    address: "Arena lower concourse, Hall 2",
    estimatedMeals: 720,
    headcount: 310,
    ratedCapacity: 450,
    capacityNote: "Field kitchen hookup · arena floor mats · pet zone",
  },
  {
    id: "sh-east-b",
    name: "Stadium parking — Pavilion B",
    warehouseId: "wh-east",
    address: "1 Stadium Way, Lot B tents",
    estimatedMeals: 540,
    headcount: 260,
    ratedCapacity: 380,
    capacityNote: "Mobile showers · bus offload · cold storage trailer",
  },
  {
    id: "sh-east-c",
    name: "Eastside middle school cafeteria",
    warehouseId: "wh-east",
    address: "40 East Blvd, cafeteria + kitchen",
    estimatedMeals: 620,
    headcount: 290,
    ratedCapacity: 420,
    capacityNote: "School kitchen line · gym overflow · volunteer desk",
  },
];

export function sheltersForWarehouse(warehouseId: string): ShelterNode[] {
  return SHELTERS.filter((s) => s.warehouseId === warehouseId).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export const PICKUP_SLOTS = [
  "Today · 16:00–18:00",
  "Today · 18:00–20:00",
  "Tomorrow · 09:00–11:00",
  "Tomorrow · 11:00–13:00",
];

/** Units per category for whole household per reservation window (demo) */
export const ALLOTMENT_PER_HOUSEHOLD: Record<
  import("./types").NutritionCategory,
  number
> = {
  protein: 2,
  carbs: 3,
  fiber: 2,
  produce: 2,
  hydration: 2,
};
