import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-black py-4 px-6 border-b border-gray-800">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="40" height="40" fill="#000000" />
              <path
                d="M12.5 8H27.5M12.5 16H27.5M12.5 24H20M12.5 32H20"
                stroke="#F2BC00"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M20 24L27.5 32"
                stroke="#F2BC00"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M27.5 24L20 32"
                stroke="#F2BC00"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </a>
        </Link>

        <nav className="hidden md:flex space-x-8">
          <Link href="/collections">
            <a className="uppercase text-sm font-medium tracking-wider">Collections</a>
          </Link>
          <Link href="/luxury-lighters">
            <a className="uppercase text-sm font-medium tracking-wider">Luxury Lighters</a>
          </Link>
          <Link href="/refilling-solutions">
            <a className="uppercase text-sm font-medium tracking-wider">Refilling Solutions</a>
          </Link>
          <Link href="/customize">
            <a className="uppercase text-sm font-medium tracking-wider">Customize</a>
          </Link>
          <Link href="/contact">
            <a className="uppercase text-sm font-medium tracking-wider">Contact</a>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <button aria-label="Toggle theme" className="text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
