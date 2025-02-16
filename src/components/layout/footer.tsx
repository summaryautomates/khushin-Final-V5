import { Link } from "wouter";
import { FaInstagram, FaFacebookF, FaTwitter, FaPinterest } from "react-icons/fa";

const Footer = () => {
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
              <li>
                <Link href="/products">
                  <span className="hover:text-primary transition-colors cursor-pointer">Products</span>
                </Link>
              </li>
              <li>
                <Link href="/customize">
                  <span className="hover:text-primary transition-colors cursor-pointer">Customize</span>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <span className="hover:text-primary transition-colors cursor-pointer">Blog</span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="hover:text-primary transition-colors cursor-pointer">Contact</span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faqs">
                  <span className="hover:text-primary transition-colors cursor-pointer">FAQs</span>
                </Link>
              </li>
              <li>
                <Link href="/shipping">
                  <span className="hover:text-primary transition-colors cursor-pointer">Shipping Info</span>
                </Link>
              </li>
              <li>
                <Link href="/returns">
                  <span className="hover:text-primary transition-colors cursor-pointer">Returns</span>
                </Link>
              </li>
              <li>
                <Link href="/warranty">
                  <span className="hover:text-primary transition-colors cursor-pointer">Warranty</span>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              {[
                { icon: FaInstagram, label: "Instagram", url: "https://instagram.com/khush.in" },
                { icon: FaFacebookF, label: "Facebook", url: "https://facebook.com/khush.in" },
                { icon: FaTwitter, label: "Twitter", url: "https://twitter.com/khush_in" },
                { icon: FaPinterest, label: "Pinterest", url: "https://pinterest.com/khush_in" }
              ].map(({ icon: Icon, label, url }) => (
                <li key={label}>
                  <a 
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} KHUSH.IN. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy">
              <span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
            </Link>
            <Link href="/terms">
              <span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;