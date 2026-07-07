"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
  createTimetableBlock,
  deleteTimetableBlock,
  updateTimetableBlock,
} from "@/lib/actions/timetable";
import type { CategoryRecord, TimetableBlockRecord } from "@/lib/db/queries";

const DAY_OPTIONS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
];

const NO_CATEGORY = "none";

export function BlockDialog({
  open,
  onOpenChange,
  categories,
  block,
  defaultDayOfWeek,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryRecord[];
  block: TimetableBlockRecord | null;
  defaultDayOfWeek: number;
}) {
  const isEditing = block !== null;
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(block?.title ?? "");
  const [categoryId, setCategoryId] = useState(block?.categoryId ?? NO_CATEGORY);
  const [dayOfWeek, setDayOfWeek] = useState(
    String(block?.dayOfWeek ?? defaultDayOfWeek),
  );
  const [startTime, setStartTime] = useState(block?.startTime.slice(0, 5) ?? "09:00");
  const [endTime, setEndTime] = useState(block?.endTime.slice(0, 5) ?? "10:00");
  const [location, setLocation] = useState(block?.location ?? "");

  function resetForm() {
    setTitle("");
    setCategoryId(NO_CATEGORY);
    setDayOfWeek(String(defaultDayOfWeek));
    setStartTime("09:00");
    setEndTime("10:00");
    setLocation("");
  }

  function handleOpenChange(next: boolean) {
    if (!next && !isEditing) resetForm();
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !startTime || !endTime) return;

    const input = {
      title: trimmedTitle,
      categoryId: categoryId === NO_CATEGORY ? null : categoryId,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      location: location.trim() || null,
      notes: null,
    };

    startTransition(async () => {
      if (isEditing) {
        await updateTimetableBlock(block.id, input);
        toast.success("Block updated");
      } else {
        await createTimetableBlock(input);
        toast.success("Block added");
        resetForm();
      }
      onOpenChange(false);
    });
  }

  function handleDelete() {
    if (!block) return;
    startTransition(async () => {
      await deleteTimetableBlock(block.id);
      toast.success("Block removed");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit block" : "New block"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="block-title">Title</Label>
            <Input
              id="block-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep work"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="block-day">Day</Label>
            <Select
              value={dayOfWeek}
              onValueChange={(value) => value && setDayOfWeek(value)}
            >
              <SelectTrigger id="block-day" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAY_OPTIONS.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="block-start">Start</Label>
              <Input
                id="block-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="block-end">End</Label>
              <Input
                id="block-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="block-category">Category</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => value && setCategoryId(value)}
            >
              <SelectTrigger id="block-category" className="w-full">
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="block-location">Location (optional)</Label>
            <Input
              id="block-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Office"
            />
          </div>

          <DialogFooter className="items-center sm:justify-between">
            {isEditing ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={isPending}>
              {isEditing ? "Save changes" : "Add block"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
