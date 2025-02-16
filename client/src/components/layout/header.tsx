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
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <span className="text-2xl font-light tracking-wider">KHUSH.IN</span>
          </a>
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="space-x-2">
            <NavigationMenuItem>
              <Link href="/products">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} font-light`}>
                  Collection
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            {categories.map((category) => (
              <NavigationMenuItem key={category.id}>
                <Link href={`/products/category/${category.id}`}>
                  <NavigationMenuLink className={`${navigationMenuTriggerStyle()} font-light`}>
                    {category.name}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
            <NavigationMenuItem>
              <Link href="/blog">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} font-light`}>
                  Journal
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/contact">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} font-light`}>
                  Contact
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}