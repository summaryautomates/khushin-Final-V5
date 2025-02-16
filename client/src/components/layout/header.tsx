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

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full bg-black/95 backdrop-blur">
      <div className="container flex h-24 items-center justify-between">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <span className="text-2xl tracking-[0.2em] text-white">KHUSH.IN</span>
          </a>
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="space-x-8">
            <NavigationMenuItem>
              <Link href="/products">
                <NavigationMenuLink className="text-sm tracking-widest text-zinc-300 hover:text-white transition-colors">
                  COLLECTION
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            {categories.map((category) => (
              <NavigationMenuItem key={category.id}>
                <Link href={`/products/category/${category.id}`}>
                  <NavigationMenuLink className="text-sm tracking-widest text-zinc-300 hover:text-white transition-colors">
                    {category.name.toUpperCase()}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
            <NavigationMenuItem>
              <Link href="/blog">
                <NavigationMenuLink className="text-sm tracking-widest text-zinc-300 hover:text-white transition-colors">
                  JOURNAL
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/contact">
                <NavigationMenuLink className="text-sm tracking-widest text-zinc-300 hover:text-white transition-colors">
                  CONTACT
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}