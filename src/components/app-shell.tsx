"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AppSidebar, NavLinks } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useHasMounted } from "@/hooks/use-has-mounted";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const hasMounted = useHasMounted();
  const todayLabel = hasMounted ? format(new Date(), "EEEE, MMM d") : null;

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col md:ml-[280px]">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant/50 bg-surface px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open navigation"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-4">
                <SheetHeader className="px-2 pb-2">
                  <SheetTitle className="font-heading text-primary">
                    Daily Planner
                  </SheetTitle>
                </SheetHeader>
                <NavLinks onNavigate={() => setMobileNavOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="font-heading text-lg font-bold text-primary md:hidden">
              Daily Planner
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs uppercase tracking-wide text-on-surface-variant sm:inline">
              {todayLabel}
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
