import type { Product } from "@shared/schema";

export const categories = [
  { id: "lighters", name: "Stylized Lighters" },
  { id: "warmers", name: "Winter Warmers" },
  { id: "outdoor", name: "Outdoor Equipment" },
  { id: "sustainable", name: "Sustainable Products" },
  { id: "refueling", name: "Refueling Solutions" }
] as const;

export type Category = typeof categories[number]["id"];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(price / 100);
}

export function getCategoryName(categoryId: string): string {
  return categories.find(c => c.id === categoryId)?.name || categoryId;
}
