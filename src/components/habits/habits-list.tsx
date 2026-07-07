"use client";

import { useState, useTransition } from "react";
import { Flame, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HabitDialog } from "@/components/habits/habit-dialog";
import { deleteHabit, setHabitLog } from "@/lib/actions/habits";
import type { CategoryRecord, HabitLogRecord, HabitRecord } from "@/lib/db/queries";

export type WeekDay = { date: string; dayOfWeek: number; label: string };

export function HabitsList({
  habits,
  logs,
  weekDays,
  categories,
}: {
  habits: HabitRecord[];
  logs: HabitLogRecord[];
  weekDays: WeekDay[];
  categories: CategoryRecord[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const completedByKey = new Map(
    logs.filter((l) => l.completed).map((l) => [`${l.habitId}|${l.logDate}`, true]),
  );

  function handleToggle(habitId: string, date: string, nextCompleted: boolean) {
    startTransition(async () => {
      await setHabitLog(habitId, date, nextCompleted);
    });
  }

  function handleDelete(habitId: string, title: string) {
    startTransition(async () => {
      await deleteHabit(habitId);
      toast.success(`"${title}" deleted`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          New habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant/60 bg-card p-10 text-center">
          <Flame className="size-8 text-on-surface-variant/50" aria-hidden />
          <p className="font-body text-sm text-on-surface-variant">
            No habits yet. Click &quot;New habit&quot; to start tracking one.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-card">
          <div
            className="grid items-center gap-2 border-b border-outline-variant/30 px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-on-surface-variant"
            style={{ gridTemplateColumns: "1fr repeat(7, 2.25rem) 2rem" }}
          >
            <span>Habit</span>
            {weekDays.map((day) => (
              <span key={day.date} className="text-center">
                {day.label}
              </span>
            ))}
            <span />
          </div>

          <ul className="divide-y divide-outline-variant/30">
            {habits.map((habit) => {
              const category = habit.categoryId
                ? categoryById.get(habit.categoryId)
                : undefined;

              return (
                <li
                  key={habit.id}
                  className="grid items-center gap-2 px-4 py-3"
                  style={{ gridTemplateColumns: "1fr repeat(7, 2.25rem) 2rem" }}
                >
                  <div className="flex items-center gap-2 pr-2">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: category?.color ?? "#777587" }}
                      aria-hidden
                    />
                    <span className="truncate font-body text-sm text-on-surface">
                      {habit.title}
                    </span>
                  </div>

                  {weekDays.map((day) => {
                    const isTarget = habit.targetDays.includes(day.dayOfWeek);
                    const isCompleted = completedByKey.has(`${habit.id}|${day.date}`);

                    return (
                      <button
                        key={day.date}
                        type="button"
                        disabled={!isTarget || isPending}
                        aria-label={`${habit.title} on ${day.date}${isTarget ? (isCompleted ? ", completed" : ", not completed") : ", not scheduled"}`}
                        aria-pressed={isCompleted}
                        onClick={() => handleToggle(habit.id, day.date, !isCompleted)}
                        className={cn(
                          "mx-auto flex size-6 items-center justify-center rounded-full border transition-colors",
                          !isTarget && "border-transparent",
                          isTarget &&
                            !isCompleted &&
                            "border-outline-variant hover:border-primary",
                          isCompleted && "border-primary bg-primary",
                        )}
                      >
                        {isCompleted && (
                          <span className="size-2.5 rounded-full bg-primary-foreground" />
                        )}
                      </button>
                    );
                  })}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="justify-self-end text-destructive hover:text-destructive"
                    aria-label={`Delete "${habit.title}"`}
                    onClick={() => handleDelete(habit.id, habit.title)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <HabitDialog open={dialogOpen} onOpenChange={setDialogOpen} categories={categories} />
    </div>
  );
}
