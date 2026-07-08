"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteDialog } from "@/components/notes/note-dialog";
import type { CategoryRecord, NoteRecord } from "@/lib/db/queries";

export function TodayNotes({
  notes,
  categories,
  todayDate,
}: {
  notes: NoteRecord[];
  categories: CategoryRecord[];
  todayDate: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteRecord | null>(null);

  function openCreate() {
    setEditingNote(null);
    setDialogOpen(true);
  }

  function openEdit(note: NoteRecord) {
    setEditingNote(note);
    setDialogOpen(true);
  }

  return (
    <section className="rounded-xl border border-outline-variant/50 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-lg text-on-surface">Notes for today</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Add note for today"
          onClick={openCreate}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {notes.length === 0 ? (
        <p className="py-4 text-center font-body text-sm text-on-surface-variant">
          No notes for today yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((note) => {
            const category = note.categoryId
              ? categories.find((c) => c.id === note.categoryId)
              : undefined;

            return (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => openEdit(note)}
                  className="flex w-full flex-col items-start gap-1 rounded-lg border border-transparent bg-surface-container-low p-3 text-left transition-colors hover:bg-surface-container-high"
                  style={{
                    borderLeftColor: category?.color ?? "#777587",
                    borderLeftWidth: 2,
                  }}
                >
                  <span className="font-body text-sm font-medium text-on-surface">
                    {note.title}
                  </span>
                  {note.content && (
                    <span className="line-clamp-2 font-body text-xs text-on-surface-variant">
                      {note.content}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <NoteDialog
        key={editingNote?.id ?? `new-${todayDate}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        note={editingNote}
        defaultLinkedDate={todayDate}
      />
    </section>
  );
}
