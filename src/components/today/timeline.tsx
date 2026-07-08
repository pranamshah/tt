"use client";

import { useSyncExternalStore, useTransition } from "react";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { setHabitLog } from "@/lib/actions/habits";
import type {
  CategoryRecord,
  HabitLogRecord,
  HabitRecord,
  TimetableBlockRecord,
} from "@/lib/db/queries";

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

type Entry =
  | { kind: "block"; time: string; block: TimetableBlockRecord }
  | { kind: "habit"; time: string; habit: HabitRecord };

export function Timeline({
  blocks,
  categories,
  habits,
  habitLogs,
  todayDate,
}: {
  blocks: TimetableBlockRecord[];
  categories: CategoryRecord[];
  habits: HabitRecord[];
  habitLogs: HabitLogRecord[];
  todayDate: string;
}) {
  const now = useNow();
  const [isPending, startTransition] = useTransition();

  const completedHabitIds = new Set(
    habitLogs.filter((l) => l.completed).map((l) => l.habitId),
  );

  const entries: Entry[] = [
    ...blocks.map((block) => ({ kind: "block" as const, time: block.startTime, block })),
    ...habits
      .filter((habit): habit is HabitRecord & { scheduledTime: string } =>
        Boolean(habit.scheduledTime),
      )
      .map((habit) => ({ kind: "habit" as const, time: habit.scheduledTime, habit })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  function handleToggleHabit(habitId: string, next: boolean) {
    startTransition(async () => {
      await setHabitLog(habitId, todayDate, next);
    });
  }

  if (entries.length === 0) {
    return (
      <div className="flex h-fit flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant/60 bg-card p-10 text-center">
        <CalendarClock className="size-8 text-on-surface-variant/50" aria-hidden />
        <p className="font-body text-sm text-on-surface-variant">
          Nothing scheduled for today.
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
        {entries.map((entry, index) => {
          if (entry.kind === "block") {
            const block = entry.block;
            const category = block.categoryId
              ? categoryById.get(block.categoryId)
              : undefined;
            const isActive =
              now !== null && now >= block.startTime && now <= block.endTime;
            const isPast = now !== null && now > block.endTime;

            return (
              <li key={`block-${block.id}`}>
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
                      <p className="text-xs text-on-surface-variant">{block.location}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          }

          const habit = entry.habit;
          const category = habit.categoryId
            ? categoryById.get(habit.categoryId)
            : undefined;
          const completed = completedHabitIds.has(habit.id);

          return (
            <li key={`habit-${habit.id}`}>
              {index > 0 && <div className="hairline-divider ml-12" />}
              <div className="group relative flex items-start gap-0 py-3">
                <span className="mt-1 w-12 pr-4 text-right font-mono text-[11px] text-on-surface-variant">
                  {formatDisplayTime(habit.scheduledTime!)}
                </span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleToggleHabit(habit.id, !completed)}
                  aria-pressed={completed}
                  className="ml-10 flex flex-1 items-center gap-2 rounded-lg border border-transparent p-3 text-left transition-colors hover:bg-surface-container-low disabled:opacity-60"
                  style={
                    category
                      ? { borderLeftColor: category.color, borderLeftWidth: 2 }
                      : undefined
                  }
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      completed ? "border-primary bg-primary" : "border-outline-variant",
                    )}
                  >
                    {completed && (
                      <span className="size-2 rounded-full bg-primary-foreground" />
                    )}
                  </span>
                  <p
                    className={cn(
                      "font-body text-sm font-bold text-on-surface",
                      completed && "text-on-surface-variant line-through opacity-70",
                    )}
                  >
                    {habit.title}
                  </p>
                  <span className="ml-auto shrink-0 rounded-full bg-secondary/60 px-1.5 py-0.5 font-mono text-[9px] text-secondary-foreground">
                    HABIT
                  </span>
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
