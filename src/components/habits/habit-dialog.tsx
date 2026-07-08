"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createHabit } from "@/lib/actions/habits";
import type { CategoryRecord } from "@/lib/db/queries";

const NO_CATEGORY = "none";

const DAY_OPTIONS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export function HabitDialog({
  open,
  onOpenChange,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryRecord[];
}) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(NO_CATEGORY);
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [scheduledTime, setScheduledTime] = useState("");

  function toggleDay(day: number) {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function resetForm() {
    setTitle("");
    setCategoryId(NO_CATEGORY);
    setTargetDays([0, 1, 2, 3, 4, 5, 6]);
    setScheduledTime("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || targetDays.length === 0) return;

    startTransition(async () => {
      await createHabit({
        title: trimmedTitle,
        categoryId: categoryId === NO_CATEGORY ? null : categoryId,
        targetDays,
        scheduledTime: scheduledTime || null,
      });
      toast.success("Habit added");
      resetForm();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New habit</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-title">Title</Label>
            <Input
              id="habit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read for 20 minutes"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-time">Time (optional)</Label>
            <Input
              id="habit-time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Target days</Label>
            <div className="flex flex-wrap gap-3">
              {DAY_OPTIONS.map((day) => (
                <label
                  key={day.value}
                  className="flex items-center gap-1.5 text-sm text-on-surface"
                >
                  <Checkbox
                    checked={targetDays.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-category">Category</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => value && setCategoryId(value)}
            >
              <SelectTrigger id="habit-category" className="w-full">
                <SelectValue placeholder="No category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              Add habit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
