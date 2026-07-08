"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { setHabitLog } from "@/lib/actions/habits";
import type { CategoryRecord, HabitLogRecord, HabitRecord } from "@/lib/db/queries";

export function TodayHabits({
  habits,
  logs,
  todayDate,
  categories,
}: {
  habits: HabitRecord[];
  logs: HabitLogRecord[];
  todayDate: string;
  categories: CategoryRecord[];
}) {
  const [isPending, startTransition] = useTransition();

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const completedIds = new Set(logs.filter((l) => l.completed).map((l) => l.habitId));

  function handleToggle(habitId: string, next: boolean) {
    startTransition(async () => {
      await setHabitLog(habitId, todayDate, next);
    });
  }

  return (
    <section className="rounded-xl border border-outline-variant/50 bg-card p-3">
      <div className="mb-2 flex items-center justify-between px-2">
        <h3 className="font-heading text-lg text-on-surface">Other habits today</h3>
      </div>

      {habits.length === 0 ? (
        <p className="px-2 py-3 font-body text-sm text-on-surface-variant">
          No other habits today — timed ones show in the timeline above.
        </p>
      ) : (
        <ul className="flex flex-col gap-1 px-1 pb-1">
          {habits.map((habit) => {
            const category = habit.categoryId ? categoryById.get(habit.categoryId) : undefined;
            const completed = completedIds.has(habit.id);

            return (
              <li key={habit.id}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleToggle(habit.id, !completed)}
                  aria-pressed={completed}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-container-low disabled:opacity-60"
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                      completed ? "border-primary bg-primary" : "border-outline-variant",
                    )}
                  >
                    {completed && (
                      <span className="size-2.5 rounded-full bg-primary-foreground" />
                    )}
                  </span>
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: category?.color ?? "#777587" }}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "font-body text-sm text-on-surface",
                      completed && "text-on-surface-variant line-through",
                    )}
                  >
                    {habit.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
