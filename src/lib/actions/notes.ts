"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { getDefaultUserId } from "@/lib/db/default-user";

export type NoteInput = {
  title: string;
  content: string | null;
  categoryId: string | null;
};

export async function createNote(input: NoteInput) {
  const userId = await getDefaultUserId();

  await db.insert(notes).values({
    userId,
    title: input.title,
    content: input.content,
    categoryId: input.categoryId,
  });

  revalidatePath("/notes");
}

export async function updateNote(noteId: string, input: NoteInput) {
  await db
    .update(notes)
    .set({
      title: input.title,
      content: input.content,
      categoryId: input.categoryId,
      updatedAt: new Date(),
    })
    .where(eq(notes.id, noteId));

  revalidatePath("/notes");
}

export async function deleteNote(noteId: string) {
  await db.delete(notes).where(eq(notes.id, noteId));
  revalidatePath("/notes");
}
