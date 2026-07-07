"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  Flame,
  LayoutDashboard,
  Settings,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/today", label: "Today", icon: LayoutDashboard, enabled: true },
  {
    href: "/timetable",
    label: "Timetable",
    icon: CalendarDays,
    enabled: true,
  },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, enabled: true },
  { href: "/notes", label: "Notes", icon: StickyNote, enabled: false },
  { href: "/habits", label: "Habits", icon: Flame, enabled: false },
  { href: "/settings", label: "Settings", icon: Settings, enabled: false },
] as const;

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname?.startsWith(item.href);

        if (!item.enabled) {
          return (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-lg p-3 text-on-surface-variant/50 font-mono text-sm cursor-not-allowed"
              aria-disabled="true"
            >
              <span className="flex items-center gap-3">
                <Icon className="size-[18px]" aria-hidden />
                {item.label}
              </span>
              <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] tracking-wide">
                Soon
              </span>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg p-3 font-mono text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "bg-secondary text-secondary-foreground"
                : "text-on-surface-variant hover:bg-surface-container-high",
            )}
          >
            <Icon className="size-[18px]" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar() {
  return (
    <aside className="fixed left-0 top-0 hidden h-full w-[280px] flex-col border-r border-outline-variant/50 bg-surface-container-low p-4 md:flex">
      <div className="px-2 py-3">
        <h1 className="font-heading text-xl font-bold text-primary">
          Daily Planner
        </h1>
      </div>
      <NavLinks />
    </aside>
  );
}
