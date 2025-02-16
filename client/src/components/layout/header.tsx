import { Link } from "wouter";
//import { Button } from "@/components/ui/button"; //Removed as not used in the replacement
//import {
//  NavigationMenu,
//  NavigationMenuItem,
//  NavigationMenuLink,
//  NavigationMenuList,
//  navigationMenuTriggerStyle,
//} from "@/components/ui/navigation-menu"; //Removed as not used in the replacement
import { Shield, StarIcon, LockIcon } from '@heroicons/react/24/solid'; // Added necessary imports


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold">TrustMark</span>
          </a>
          <div className="flex items-center text-sm text-muted-foreground">
            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
            <span>4.9/5 Trusted Rating</span>
          </div>
        </div>
        <nav className="flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium">Home</Link>
          <Link to="/products" className="text-sm font-medium">Products</Link>
          <Link to="/contact" className="text-sm font-medium">Contact</Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LockIcon className="h-4 w-4" />
            <span>Secure Shopping</span>
          </div>
        </nav>
      </div>
    </header>
  );
}