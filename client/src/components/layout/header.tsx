import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ShoppingCart, ClockIcon, UserCircle2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { AuthSheet } from "@/components/auth/auth-sheet";

export function Header() {
  const cart = useCart();
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const cartItemCount = cart.items?.length || 0;

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation("/");
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/95 to-black/85 backdrop-blur-md supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 md:h-24 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <img
              src="https://api.deepai.org/job-view-file/21c38ff0-a48f-49e4-91f0-3094fe3db926/outputs/output.jpg"
              alt="KHUSH.IN Logo"
              className="h-12 md:h-14 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80 max-w-[180px] md:max-w-[200px]"
            />
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="space-x-6">
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

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link href="/orders">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative group hover:bg-white/10 transition-all duration-300 border border-white/20 gap-2 backdrop-blur-sm"
                  >
                    <ClockIcon className="h-4 w-4 text-white/90 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                    <span className="text-white/90 font-light tracking-wide group-hover:text-primary transition-colors">Orders</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  className="relative group hover:bg-white/10 transition-all duration-300"
                  onClick={handleLogout}
                >
                  <UserCircle2 className="h-4 w-4 text-white group-hover:scale-110 transition-transform duration-300" />
                  <span className="sr-only">Logout</span>
                </Button>

                <Link href="/cart">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative group hover:bg-white/5 transition-colors duration-300"
                  >
                    <ShoppingCart className="h-4 w-4 text-white group-hover:scale-110 transition-transform duration-300" />
                    <span className="sr-only">Shopping Cart</span>
                    {!cart.isLoading && cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-4 h-4 rounded-full text-xs flex items-center justify-center animate-in slide-in-from-top-2 duration-300">
                        {cartItemCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            ) : (
              <AuthSheet />
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </header>
  );
}