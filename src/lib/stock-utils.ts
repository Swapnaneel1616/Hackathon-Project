import type { NutritionCategory, StockLevel, Warehouse } from "./types";

const GREEN_MIN = 0.6;
const YELLOW_MIN = 0.25;

export function levelForCategory(
  w: Warehouse,
  cat: NutritionCategory,
): StockLevel {
  const cap = w.categoryCaps[cat] || 1;
  const ratio = (w.categoryStock[cat] || 0) / cap;
  if (ratio >= GREEN_MIN) return "green";
  if (ratio >= YELLOW_MIN) return "yellow";
  return "red";
}

export function redSeverityScore(w: Warehouse): number {
  const cats = Object.keys(w.categoryCaps) as NutritionCategory[];
  return cats.reduce((acc, c) => {
    const lv = levelForCategory(w, c);
    if (lv === "red") return acc + 3;
    if (lv === "yellow") return acc + 1;
    return acc;
  }, 0);
}

export function sortWarehousesByUrgency(warehouses: Warehouse[]): Warehouse[] {
  return [...warehouses].sort(
    (a, b) => redSeverityScore(b) - redSeverityScore(a),
  );
}
