"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Star, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", icon: House, label: "首页" },
  { href: "/favorites", icon: Star, label: "收藏" },
  { href: "/settings", icon: Settings, label: "设置" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around h-14">
        {items.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
