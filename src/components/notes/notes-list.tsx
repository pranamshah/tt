"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteDialog } from "@/components/notes/note-dialog";
import type { CategoryRecord, NoteRecord } from "@/lib/db/queries";

export function NotesList({
  notes,
  categories,
}: {
  notes: NoteRecord[];
  categories: CategoryRecord[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteRecord | null>(null);

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  function openCreate() {
    setEditingNote(null);
    setDialogOpen(true);
  }

  function openEdit(note: NoteRecord) {
    setEditingNote(note);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          New note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-outline-variant/60 bg-card p-10 text-center">
          <StickyNote className="size-8 text-on-surface-variant/50" aria-hidden />
          <p className="font-body text-sm text-on-surface-variant">
            No notes yet. Click &quot;New note&quot; to write one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => {
            const category = note.categoryId
              ? categoryById.get(note.categoryId)
              : undefined;

            return (
              <button
                key={note.id}
                type="button"
                onClick={() => openEdit(note)}
                className="flex flex-col items-start gap-2 rounded-xl border border-outline-variant/50 bg-card p-4 text-left transition-colors hover:bg-surface-container-low"
                style={{
                  borderTopColor: category?.color ?? "#777587",
                  borderTopWidth: 3,
                }}
              >
                <h3 className="font-heading text-base font-semibold text-on-surface">
                  {note.title}
                </h3>
                {note.content && (
                  <p className="line-clamp-4 font-body text-sm whitespace-pre-wrap text-on-surface-variant">
                    {note.content}
                  </p>
                )}
                <span className="mt-auto pt-2 font-mono text-[10px] text-on-surface-variant/60">
                  {format(new Date(note.updatedAt), "MMM d, yyyy")}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <NoteDialog
        key={editingNote?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        note={editingNote}
      />
    </div>
  );
}
