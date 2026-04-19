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

export const SHELTERS: ShelterNode[] = [
  {
    id: "sh-1",
    name: "Memorial Field — Shelter A",
    warehouseId: "wh-north",
    address: "Memorial Field, Gate C",
    estimatedMeals: 1400,
    headcount: 620,
  },
  {
    id: "sh-2",
    name: "Riverside HS Gymnasium",
    warehouseId: "wh-river",
    address: "200 School Ln",
    estimatedMeals: 980,
    headcount: 410,
  },
  {
    id: "sh-3",
    name: "Eastside Arena — Hall 2",
    warehouseId: "wh-east",
    address: "Arena lower concourse",
    estimatedMeals: 2100,
    headcount: 880,
  },
];

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
