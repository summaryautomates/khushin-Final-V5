import type { Product } from "@shared/schema";

export const categories = [
  { id: "lighters", name: "Luxury Lighters" },
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