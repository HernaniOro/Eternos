"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { refreshSeed } from "@/lib/algorithm";

function HomeIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-6 md:h-6 fill-current">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-6 md:h-6 fill-none stroke-current stroke-2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SearchIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`w-7 h-7 md:w-6 md:h-6 fill-none stroke-current ${filled ? "stroke-[2.5]" : "stroke-2"}`}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-6 md:h-6 fill-current">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-6 md:h-6 fill-none stroke-current stroke-2">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const navItems = [
  { href: "/", label: "Início", Icon: HomeIcon },
  { href: "/explore", label: "Explorar", Icon: SearchIcon },
  { href: "/saved", label: "Salvos", Icon: BookmarkIcon },
];

export default function Sidebar({
  onRefreshFeed,
}: {
  onRefreshFeed?: () => void;
}) {
  const pathname = usePathname();

  const basePath = process.env.__NEXT_ROUTER_BASEPATH || "";

  function handleHomeClick(e: React.MouseEvent) {
    if (pathname === "/") {
      e.preventDefault();
      refreshSeed();
      onRefreshFeed?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      refreshSeed();
      onRefreshFeed?.();
    }
  }

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <nav className="hidden md:flex sticky top-0 h-screen flex-col items-end pr-4 pt-4 w-[68px] xl:w-[275px]">
        {/* Logo */}
        <a
          href={basePath + "/"}
          onClick={handleHomeClick}
          className="flex items-center gap-3 px-3 py-3 rounded-full hover:bg-zinc-900 transition-colors mb-2 cursor-pointer"
        >
          <span className="text-2xl font-serif font-bold text-zinc-100">M</span>
          <span className="hidden xl:block text-xl font-serif font-bold text-zinc-100">
            Mirabiles
          </span>
        </a>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isHome = item.href === "/";

          if (isHome) {
            return (
              <a
                key={item.href}
                href="/"
                onClick={handleHomeClick}
                className={`flex items-center gap-4 px-3 py-3 rounded-full hover:bg-zinc-900 transition-colors w-full xl:w-auto cursor-pointer ${
                  isActive ? "font-bold" : ""
                }`}
              >
                <item.Icon filled={isActive} />
                <span className="hidden xl:block text-xl text-zinc-100">
                  {item.label}
                </span>
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-3 py-3 rounded-full hover:bg-zinc-900 transition-colors w-full xl:w-auto ${
                isActive ? "font-bold" : ""
              }`}
            >
              <item.Icon filled={isActive} />
              <span className="hidden xl:block text-xl text-zinc-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Mobile bottom tab bar (hidden on desktop) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-700 safe-area-bottom" style={{ backgroundColor: "#16181c" }}>
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isHome = item.href === "/";

            if (isHome) {
              return (
                <a
                  key={item.href}
                  href="/"
                  onClick={handleHomeClick}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                    isActive ? "text-zinc-100" : "text-zinc-500"
                  }`}
                >
                  <item.Icon filled={isActive} />
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? "text-zinc-100" : "text-zinc-500"
                }`}
              >
                <item.Icon filled={isActive} />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
