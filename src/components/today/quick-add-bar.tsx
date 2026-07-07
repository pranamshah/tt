"use client";

import { useRef, useState, useTransition } from "react";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { quickAddTask } from "@/lib/actions/tasks";

export function QuickAddBar() {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    setValue("");
    startTransition(async () => {
      await quickAddTask(trimmed);
      toast.success("Task added");
      inputRef.current?.focus();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 rounded-t-lg border-b-2 border-outline-variant bg-card px-4 py-3 shadow-sm transition-colors focus-within:border-primary"
    >
      <Zap className="size-5 shrink-0 text-primary" aria-hidden />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="I need to... (try &quot;tomorrow 5pm #health&quot;)"
        disabled={isPending}
        aria-label="Quick add a task"
        className="flex-1 border-none bg-transparent p-0 font-body text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <span className="hidden shrink-0 font-mono text-xs text-on-surface-variant/60 sm:inline">
        Press ↵ to add
      </span>
    </form>
  );
}
