"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import MobileNav from "./MobileNav";

const navLinks = [
  { href: "/news/ai", label: "AI" },
  { href: "/news/embedded", label: "Embedded" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-lg tracking-tight"
          >
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              AI
            </span>
            nsight
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm transition-colors hover:text-foreground",
                  pathname.startsWith(href)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/favorites"
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                pathname === "/favorites"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              <Star size={18} />
            </Link>
            <Link
              href="/settings"
              className={cn(
                "transition-colors hover:text-foreground",
                pathname === "/settings"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Settings size={18} />
            </Link>
          </div>

          {/* Mobile: just logo, bottom nav handles the rest */}
          <div className="md:hidden" />
        </div>
      </nav>

      <div className="flex-1 pb-14 md:pb-0">{children}</div>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span>© AInsight</span>
          <span>Powered by DeepSeek</span>
        </div>
      </footer>

      <MobileNav />
    </div>
  );
}
