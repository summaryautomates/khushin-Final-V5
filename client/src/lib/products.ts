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

export function parsePostgresArray(arrayString: string | null): string[] {
  if (!arrayString) return [];
  // Remove the curly braces and split by comma
  const cleanString = arrayString.replace(/[{}]/g, '');
  
  // Parse each item, removing any extra double quotes
  return cleanString.split(',')
    .map(item => {
      // Trim whitespace and remove double quotes
      let cleaned = item.trim();
      // Handle double-quoted strings by removing outer quotes
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
      }
      // Handle any additional embedded quotes (like in ""path"")
      cleaned = cleaned.replace(/""/g, '');
      return cleaned;
    })
    // Filter out empty strings
    .filter(path => path.length > 0);
}