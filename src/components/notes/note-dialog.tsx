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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createNote, deleteNote, updateNote } from "@/lib/actions/notes";
import type { CategoryRecord, NoteRecord } from "@/lib/db/queries";

const NO_CATEGORY = "none";

export function NoteDialog({
  open,
  onOpenChange,
  categories,
  note,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryRecord[];
  note: NoteRecord | null;
}) {
  const isEditing = note !== null;
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [categoryId, setCategoryId] = useState(note?.categoryId ?? NO_CATEGORY);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const input = {
      title: trimmedTitle,
      content: content.trim() || null,
      categoryId: categoryId === NO_CATEGORY ? null : categoryId,
    };

    startTransition(async () => {
      if (isEditing) {
        await updateNote(note.id, input);
        toast.success("Note updated");
      } else {
        await createNote(input);
        toast.success("Note added");
        setTitle("");
        setContent("");
        setCategoryId(NO_CATEGORY);
      }
      onOpenChange(false);
    });
  }

  function handleDelete() {
    if (!note) return;
    startTransition(async () => {
      await deleteNote(note.id);
      toast.success("Note deleted");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit note" : "New note"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Meeting notes"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write something..."
              rows={6}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note-category">Category</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => value && setCategoryId(value)}
            >
              <SelectTrigger id="note-category" className="w-full">
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
              {isEditing ? "Save changes" : "Add note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
