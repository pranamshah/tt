"use client";

import { useState } from "react";
import { CalendarPlus, Flame, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockDialog } from "@/components/timetable/block-dialog";
import { cn } from "@/lib/utils";
import type { CategoryRecord, HabitRecord, TimetableBlockRecord } from "@/lib/db/queries";

const DAYS = [
  { dayOfWeek: 1, label: "Monday", short: "Mon" },
  { dayOfWeek: 2, label: "Tuesday", short: "Tue" },
  { dayOfWeek: 3, label: "Wednesday", short: "Wed" },
  { dayOfWeek: 4, label: "Thursday", short: "Thu" },
  { dayOfWeek: 5, label: "Friday", short: "Fri" },
  { dayOfWeek: 6, label: "Saturday", short: "Sat" },
  { dayOfWeek: 0, label: "Sunday", short: "Sun" },
];

function formatDisplayTime(time: string) {
  const [hoursStr, minutes] = time.split(":");
  const hours = Number(hoursStr);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes} ${period}`;
}

export function WeekGrid({
  blocks,
  categories,
  habits,
}: {
  blocks: TimetableBlockRecord[];
  categories: CategoryRecord[];
  habits: HabitRecord[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimetableBlockRecord | null>(null);
  const [activeDay, setActiveDay] = useState(1);

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const blocksByDay = new Map<number, TimetableBlockRecord[]>();
  for (const block of blocks) {
    if (block.dayOfWeek === null) continue;
    const list = blocksByDay.get(block.dayOfWeek) ?? [];
    list.push(block);
    blocksByDay.set(block.dayOfWeek, list);
  }

  const habitsByDay = new Map<number, HabitRecord[]>();
  for (const habit of habits) {
    for (const day of habit.targetDays) {
      const list = habitsByDay.get(day) ?? [];
      list.push(habit);
      habitsByDay.set(day, list);
    }
  }

  function openCreate(dayOfWeek: number) {
    setEditingBlock(null);
    setActiveDay(dayOfWeek);
    setDialogOpen(true);
  }

  function openEdit(block: TimetableBlockRecord) {
    setEditingBlock(block);
    setActiveDay(block.dayOfWeek ?? 1);
    setDialogOpen(true);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {DAYS.map((day) => {
          const dayBlocks = (blocksByDay.get(day.dayOfWeek) ?? []).sort((a, b) =>
            a.startTime.localeCompare(b.startTime),
          );
          const dayHabits = (habitsByDay.get(day.dayOfWeek) ?? []).sort((a, b) =>
            (a.scheduledTime ?? "").localeCompare(b.scheduledTime ?? ""),
          );

          return (
            <div
              key={day.dayOfWeek}
              className="flex flex-col rounded-xl border border-outline-variant/50 bg-card"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/30 px-3 py-2">
                <h3 className="font-heading text-sm font-semibold text-on-surface">
                  {day.short}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Add block on ${day.label}`}
                  onClick={() => openCreate(day.dayOfWeek)}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>

              {dayHabits.length > 0 && (
                <div className="flex flex-wrap gap-1 border-b border-outline-variant/20 px-2 pt-2 pb-1">
                  {dayHabits.map((habit) => (
                    <span
                      key={habit.id}
                      className="flex items-center gap-1 rounded-full bg-secondary/60 px-2 py-0.5 font-mono text-[10px] text-secondary-foreground"
                    >
                      <Flame className="size-2.5" aria-hidden />
                      {habit.title}
                      {habit.scheduledTime && (
                        <span className="text-secondary-foreground/70">
                          {formatDisplayTime(habit.scheduledTime)}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-1 flex-col gap-2 p-2">
                {dayBlocks.length === 0 ? (
                  <p className="px-1 py-3 text-center font-mono text-[11px] text-on-surface-variant/50">
                    No blocks
                  </p>
                ) : (
                  dayBlocks.map((block) => {
                    const category = block.categoryId
                      ? categoryById.get(block.categoryId)
                      : undefined;

                    return (
                      <button
                        key={block.id}
                        type="button"
                        onClick={() => openEdit(block)}
                        className={cn(
                          "flex flex-col items-start gap-0.5 rounded-lg border border-transparent bg-surface-container-low p-2 text-left transition-colors hover:bg-surface-container-high",
                        )}
                        style={{
                          borderLeftColor: category?.color ?? "#777587",
                          borderLeftWidth: 2,
                        }}
                      >
                        <span className="font-mono text-[10px] text-on-surface-variant">
                          {formatDisplayTime(block.startTime)} –{" "}
                          {formatDisplayTime(block.endTime)}
                        </span>
                        <span className="font-body text-sm font-medium text-on-surface">
                          {block.title}
                        </span>
                        {block.location && (
                          <span className="font-body text-xs text-on-surface-variant">
                            {block.location}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {blocks.length === 0 && (
        <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant/60 bg-card p-10 text-center">
          <CalendarPlus className="size-8 text-on-surface-variant/50" aria-hidden />
          <p className="font-body text-sm text-on-surface-variant">
            No recurring blocks yet. Add one to any day to build your weekly schedule.
          </p>
        </div>
      )}

      <BlockDialog
        key={editingBlock?.id ?? `new-${activeDay}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        block={editingBlock}
        defaultDayOfWeek={activeDay}
      />
    </>
  );
}
