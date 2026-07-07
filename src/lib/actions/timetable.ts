"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { timetableBlocks } from "@/lib/db/schema";
import { getDefaultUserId } from "@/lib/db/default-user";

export type TimetableBlockInput = {
  title: string;
  categoryId: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  notes: string | null;
};

export async function createTimetableBlock(input: TimetableBlockInput) {
  const userId = await getDefaultUserId();

  await db.insert(timetableBlocks).values({
    userId,
    title: input.title,
    categoryId: input.categoryId,
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    notes: input.notes,
    isRecurring: true,
  });

  revalidatePath("/timetable");
}

export async function updateTimetableBlock(
  blockId: string,
  input: TimetableBlockInput,
) {
  await db
    .update(timetableBlocks)
    .set({
      title: input.title,
      categoryId: input.categoryId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      location: input.location,
      notes: input.notes,
    })
    .where(eq(timetableBlocks.id, blockId));

  revalidatePath("/timetable");
}

export async function deleteTimetableBlock(blockId: string) {
  await db.delete(timetableBlocks).where(eq(timetableBlocks.id, blockId));
  revalidatePath("/timetable");
}
