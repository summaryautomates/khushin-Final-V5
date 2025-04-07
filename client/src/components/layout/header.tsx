import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, ClockIcon, UserCircle2, Menu, Flame } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useLocation } from "wouter";
import { AuthSheet } from "@/components/auth/auth-sheet";
import { useState } from "react";

export function Header() {
  const cart = useCart();
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const cartItemCount = cart.items?.length || 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation("/");
  };
  
  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    setLocation(path);
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/95 to-black/85 backdrop-blur-md supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto px-2 md:px-4 max-w-screen-2xl">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-24 md:w-32 h-12 md:h-16 flex items-center group transition-transform duration-300 hover:scale-105">
              <img
                src="/logo.png"
                alt="KHUSH.IN Logo"
                className="w-full h-full object-contain transition-all duration-300"
                style={{
                  filter: "brightness(1.1) contrast(1.05)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </Link>

          <div className="hidden md:flex flex-1 justify-center">
            <nav className="flex items-center">
              <Link
                href="/products"
                className="text-xs uppercase tracking-wide text-zinc-300 hover:text-white transition-all duration-300 px-2.5 py-2 mx-1"
              >
                Collections
              </Link>
              <Link
                href="/products/category/lighters"
                className="text-xs uppercase tracking-wide text-zinc-300 hover:text-white transition-all duration-300 px-2.5 py-2 mx-1"
              >
                Luxury Lighters
              </Link>
              <Link
                href="/refueling"
                className="text-xs uppercase tracking-wide text-zinc-300 hover:text-white transition-all duration-300 px-2.5 py-2 mx-1"
              >
                Refueling
              </Link>
              <Link
                href="/customize"
                className="text-xs uppercase tracking-wide text-zinc-300 hover:text-white transition-all duration-300 px-2.5 py-2 mx-1"
              >
                Customize
              </Link>
              <Link
                href="/showroom"
                className="text-xs uppercase tracking-wide text-zinc-300 hover:text-white transition-all duration-300 px-2.5 py-2 mx-1 flex items-center"
              >
                <Flame className="mr-1 h-3 w-3 text-primary" />
                Showroom
              </Link>
              <Link
                href="/contact"
                className="text-xs uppercase tracking-wide text-zinc-300 hover:text-white transition-all duration-300 px-2.5 py-2 mx-1"
              >
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mobile Navigation Menu */}
            <div className="md:hidden">
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative group hover:bg-white/10 transition-all duration-300 mr-1"
                  >
                    <Menu className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" />
                    <span className="sr-only">Menu</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="min-w-[250px] backdrop-blur-lg bg-black/90 border border-white/10 p-3"
                  align="end"
                  sideOffset={24}
                >
                  <DropdownMenuItem 
                    className="text-white uppercase tracking-wide text-xs py-2.5 mb-1 hover:bg-white/10 focus:bg-white/10 transition-all duration-300 hover:text-primary focus:text-primary"
                    onClick={() => handleNavigate("/products")}
                  >
                    Collections
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-white uppercase tracking-wide text-xs py-2.5 mb-1 hover:bg-white/10 focus:bg-white/10 transition-all duration-300 hover:text-primary focus:text-primary"
                    onClick={() => handleNavigate("/products/category/lighters")}
                  >
                    Luxury Lighters
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-white uppercase tracking-wide text-xs py-2.5 mb-1 hover:bg-white/10 focus:bg-white/10 transition-all duration-300 hover:text-primary focus:text-primary"
                    onClick={() => handleNavigate("/refueling")}
                  >
                    Refueling
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-white uppercase tracking-wide text-xs py-2.5 mb-1 hover:bg-white/10 focus:bg-white/10 transition-all duration-300 hover:text-primary focus:text-primary"
                    onClick={() => handleNavigate("/customize")}
                  >
                    Customize
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-white uppercase tracking-wide text-xs py-2.5 mb-1 hover:bg-white/10 focus:bg-white/10 transition-all duration-300 hover:text-primary focus:text-primary flex gap-2 items-center"
                    onClick={() => handleNavigate("/showroom")}
                  >
                    <Flame className="h-3 w-3 text-primary" />
                    Showroom
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-white uppercase tracking-wide text-xs py-2.5 mb-1 hover:bg-white/10 focus:bg-white/10 transition-all duration-300 hover:text-primary focus:text-primary"
                    onClick={() => handleNavigate("/contact")}
                  >
                    Contact
                  </DropdownMenuItem>
                  

                  
                  {/* Add orders link for authenticated users in mobile view */}
                  {user && (
                    <DropdownMenuItem 
                      className="text-white uppercase tracking-wide text-xs py-2.5 mt-2 border-t border-white/10 hover:bg-white/10 focus:bg-white/10 transition-all duration-300 hover:text-primary focus:text-primary flex gap-2 items-center"
                      onClick={() => handleNavigate("/orders")}
                    >
                      <ClockIcon className="h-3 w-3" />
                      My Orders
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {user ? (
              <>
                <Link href="/orders">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative group hover:bg-white/10 transition-all duration-300 border border-white/20 gap-2 backdrop-blur-sm hidden sm:flex"
                  >
                    <ClockIcon className="h-4 w-4 text-white/90 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                    <span className="text-white/90 font-light tracking-wide group-hover:text-primary transition-colors">
                      Orders
                    </span>
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
                    {/* Make the cart indicator more visible */}
                    {!cart.isLoading && cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center animate-in slide-in-from-top-2 duration-300 font-medium border border-white/20">
                        {cartItemCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <AuthSheet />
              </>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </header>
  );
}