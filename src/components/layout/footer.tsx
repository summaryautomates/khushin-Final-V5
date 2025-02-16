import React from "react";
import { Link } from "wouter";
import { FaInstagram, FaFacebookF, FaTwitter, FaPinterest } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary/5 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-bold mb-4">About KHUSH.IN</h3>
            <p className="text-sm text-muted-foreground">
              Since 2024, KHUSH.IN has been redefining luxury fashion with a perfect blend of traditional craftsmanship and modern innovation. Every piece tells a story of excellence.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-primary transition-colors">Products</Link></li>
              <li><Link href="/customize" className="hover:text-primary transition-colors">Customize</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/support/faqs" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link href="/support/shipping" className="hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><Link href="/support/returns" className="hover:text-primary transition-colors">Returns</Link></li>
              <li><Link href="/support/warranty" className="hover:text-primary transition-colors">Warranty</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://instagram.com/khush.in" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 hover:text-primary transition-colors">
                  <FaInstagram className="w-4 h-4" /> Instagram
                </a>
              </li>
              <li>
                <a href="https://facebook.com/khush.in" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 hover:text-primary transition-colors">
                  <FaFacebookF className="w-4 h-4" /> Facebook
                </a>
              </li>
              <li>
                <a href="https://twitter.com/khush_in" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 hover:text-primary transition-colors">
                  <FaTwitter className="w-4 h-4" /> Twitter
                </a>
              </li>
              <li>
                <a href="https://pinterest.com/khush_in" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 hover:text-primary transition-colors">
                  <FaPinterest className="w-4 h-4" /> Pinterest
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} KHUSH.IN. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;