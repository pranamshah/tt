"use client";

import { useSyncExternalStore } from "react";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryRecord, TimetableBlockRecord } from "@/lib/db/queries";

function nowAsTimeString() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function subscribeToClock(callback: () => void) {
  const id = setInterval(callback, 60_000);
  return () => clearInterval(id);
}

function useNow() {
  return useSyncExternalStore(subscribeToClock, nowAsTimeString, () => null);
}

function formatDisplayTime(time: string) {
  const [hoursStr, minutes] = time.split(":");
  const hours = Number(hoursStr);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(displayHours).padStart(2, "0")}:${minutes} ${period}`;
}

export function Timeline({
  blocks,
  categories,
}: {
  blocks: TimetableBlockRecord[];
  categories: CategoryRecord[];
}) {
  const now = useNow();

  if (blocks.length === 0) {
    return (
      <div className="flex h-fit flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant/60 bg-card p-10 text-center">
        <CalendarClock className="size-8 text-on-surface-variant/50" aria-hidden />
        <p className="font-body text-sm text-on-surface-variant">
          No blocks scheduled for today.
        </p>
      </div>
    );
  }

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return (
    <section className="h-fit rounded-xl border border-outline-variant/50 bg-card p-3">
      <div className="mb-3 flex items-center justify-between px-2">
        <h3 className="font-heading text-lg text-on-surface">Timeline</h3>
      </div>
      <ol className="relative space-y-0">
        <div
          className="absolute top-2 bottom-2 left-[47px] w-px bg-outline-variant"
          aria-hidden
        />
        {blocks.map((block, index) => {
          const category = block.categoryId
            ? categoryById.get(block.categoryId)
            : undefined;
          const isActive =
            now !== null && now >= block.startTime && now <= block.endTime;
          const isPast = now !== null && now > block.endTime;

          return (
            <li key={block.id}>
              {index > 0 && <div className="hairline-divider ml-12" />}
              <div
                className={cn(
                  "group relative flex items-start gap-0 py-3",
                  isPast && !isActive && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "mt-1 w-12 pr-4 text-right font-mono text-[11px] text-on-surface-variant",
                    isActive && "font-bold text-primary",
                  )}
                >
                  {formatDisplayTime(block.startTime)}
                </span>
                {isActive && (
                  <span
                    className="absolute top-1/2 left-[43px] size-2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/10"
                    aria-hidden
                  />
                )}
                <div
                  className={cn(
                    "ml-10 flex-1 rounded-lg border border-transparent p-3 transition-colors",
                    isActive
                      ? "border-2 border-primary bg-primary/5"
                      : "group-hover:bg-surface-container-low",
                  )}
                  style={
                    !isActive && category
                      ? { borderLeftColor: category.color, borderLeftWidth: 2 }
                      : undefined
                  }
                >
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "font-body text-sm font-bold text-on-surface",
                        isActive && "text-primary",
                      )}
                    >
                      {block.title}
                    </p>
                    {isActive && (
                      <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  {block.location && (
                    <p className="text-xs text-on-surface-variant">
                      {block.location}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
