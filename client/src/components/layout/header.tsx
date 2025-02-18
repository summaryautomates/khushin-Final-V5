import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ShoppingCart, ClockIcon } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export function Header() {
  const cart = useCart();
  const cartItemCount = cart.items?.length || 0;

  return (
    <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/95 to-black/85 backdrop-blur-md supports-[backdrop-filter]:bg-black/60 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-light tracking-[0.25em] text-white group-hover:text-primary transition-colors duration-300">
              KHUSH.IN
            </span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="space-x-8">
              <NavigationMenuItem>
                <Link 
                  href="/products" 
                  className={navigationMenuTriggerStyle() + " text-sm tracking-widest text-zinc-300 hover:text-white transition-all duration-300 hover:tracking-[0.2em]"}
                >
                  COLLECTIONS
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  href="/products/category/lighters"
                  className={navigationMenuTriggerStyle() + " text-sm tracking-widest text-zinc-300 hover:text-white transition-all duration-300 hover:tracking-[0.2em]"}
                >
                  LUXURY LIGHTERS
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  href="/refueling"
                  className={navigationMenuTriggerStyle() + " text-sm tracking-widest text-zinc-300 hover:text-white transition-all duration-300 hover:tracking-[0.2em]"}
                >
                  REFUELING SOLUTIONS
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  href="/customize"
                  className={navigationMenuTriggerStyle() + " text-sm tracking-widest text-zinc-300 hover:text-white transition-all duration-300 hover:tracking-[0.2em]"}
                >
                  CUSTOMIZE
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  href="/contact"
                  className={navigationMenuTriggerStyle() + " text-sm tracking-widest text-zinc-300 hover:text-white transition-all duration-300 hover:tracking-[0.2em]"}
                >
                  CONTACT
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-4">
            <Link href="/orders">
              <Button 
                variant="ghost" 
                size="icon"
                className="relative group hover:bg-white/5 transition-colors duration-300"
              >
                <ClockIcon className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
                <span className="sr-only">Past Orders</span>
              </Button>
            </Link>
            <Link href="/cart">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative group hover:bg-white/5 transition-colors duration-300"
              >
                <ShoppingCart className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
                <span className="sr-only">Shopping Cart</span>
                {!cart.isLoading && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center animate-in slide-in-from-top-2 duration-300">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </header>
  );
}