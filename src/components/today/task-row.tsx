"use client";

import { useState, useTransition } from "react";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setTaskStatus, snoozeTaskToTomorrow } from "@/lib/actions/tasks";
import type { TaskRecord } from "@/lib/db/queries";

export function TaskRow({
  task,
  isOverdue,
}: {
  task: TaskRecord;
  isOverdue: boolean;
}) {
  const [checked, setChecked] = useState(task.status === "done");
  const [isPending, startTransition] = useTransition();

  function handleToggle(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      await setTaskStatus(task.id, next);
    });
  }

  function handleSnooze() {
    startTransition(async () => {
      await snoozeTaskToTomorrow(task.id);
      toast.success("Moved to tomorrow");
    });
  }

  return (
    <li
      className={cn(
        "group flex items-center gap-3 p-3 transition-colors hover:bg-surface-container-lowest",
        isPending && "opacity-60",
      )}
    >
      <label className="flex flex-1 cursor-pointer items-center gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => handleToggle(Boolean(value))}
          aria-label={`Mark "${task.title}" as ${checked ? "not done" : "done"}`}
        />
        <span
          className={cn(
            "font-body text-sm text-on-surface",
            checked && "text-on-surface-variant line-through opacity-50",
          )}
        >
          {task.title}
        </span>
      </label>
      {isOverdue && !checked && (
        <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[10px] text-destructive">
          OVERDUE
        </span>
      )}
      {task.dueTime && (
        <span className="font-mono text-[11px] text-on-surface-variant">
          {task.dueTime.slice(0, 5)}
        </span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
        onClick={handleSnooze}
        aria-label={`Snooze "${task.title}" to tomorrow`}
      >
        <Clock className="size-3.5" />
      </Button>
    </li>
  );
}
