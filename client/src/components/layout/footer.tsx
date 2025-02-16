import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">Products</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/products/category/lighters">
                  <a className="text-muted-foreground hover:text-foreground">
                    Stylized Lighters
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/products/category/warmers">
                  <a className="text-muted-foreground hover:text-foreground">
                    Winter Warmers
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-foreground">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-muted-foreground hover:text-foreground">
                    Contact
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/blog">
                  <a className="text-muted-foreground hover:text-foreground">
                    Blog
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy">
                  <a className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} KHUSH.IN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
