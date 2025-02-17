import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { categories } from "@/lib/products";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export function Header() {
  const { state } = useCart();
  const cartItemCount = state.items.length;

  return (
    <header className="fixed top-0 z-50 w-full bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto px-4 flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl tracking-[0.2em] text-white">KHUSH.IN</span>
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="space-x-8">
            <NavigationMenuItem>
              <Link href="/products" className={navigationMenuTriggerStyle() + " text-sm tracking-widest text-zinc-300 hover:text-white transition-colors"}>
                COLLECTION
              </Link>
            </NavigationMenuItem>
            {categories.map((category) => (
              <NavigationMenuItem key={category.id}>
                <Link 
                  href={`/products/category/${category.id}`}
                  className={navigationMenuTriggerStyle() + " text-sm tracking-widest text-zinc-300 hover:text-white transition-colors"}
                >
                  {category.name.toUpperCase()}
                </Link>
              </NavigationMenuItem>
            ))}
            <NavigationMenuItem>
              <Link 
                href="/customize"
                className={navigationMenuTriggerStyle() + " text-sm tracking-widest text-zinc-300 hover:text-white transition-colors"}
              >
                CUSTOMIZE
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link 
                href="/contact"
                className={navigationMenuTriggerStyle() + " text-sm tracking-widest text-zinc-300 hover:text-white transition-colors"}
              >
                CONTACT
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center space-x-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5 text-white" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}