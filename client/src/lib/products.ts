
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

export async function getProduct(id: number): Promise<Product | null> {
  try {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}
