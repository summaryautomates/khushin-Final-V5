import React from "react";
import { Link } from "wouter";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/">
            <span className="flex items-center space-x-2 cursor-pointer">
              <span className="text-2xl font-bold">KHUSH.IN</span>
            </span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <span className="text-sm font-medium transition-colors hover:text-primary cursor-pointer">
                Products
              </span>
            </Link>
            <Link href="/customize">
              <span className="text-sm font-medium transition-colors hover:text-primary cursor-pointer">
                Customize
              </span>
            </Link>
            <Link href="/blog">
              <span className="text-sm font-medium transition-colors hover:text-primary cursor-pointer">
                Blog
              </span>
            </Link>
            <Link href="/contact">
              <span className="text-sm font-medium transition-colors hover:text-primary cursor-pointer">
                Contact
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;