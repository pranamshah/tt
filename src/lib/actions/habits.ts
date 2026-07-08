"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { habitLogs, habits } from "@/lib/db/schema";
import { getDefaultUserId } from "@/lib/db/default-user";

export type HabitInput = {
  title: string;
  categoryId: string | null;
  targetDays: number[];
  scheduledTime: string | null;
};

export async function createHabit(input: HabitInput) {
  const userId = await getDefaultUserId();

  await db.insert(habits).values({
    userId,
    title: input.title,
    categoryId: input.categoryId,
    targetDays: input.targetDays,
    scheduledTime: input.scheduledTime,
  });

  revalidatePath("/habits");
  revalidatePath("/today");
  revalidatePath("/timetable");
}

export async function deleteHabit(habitId: string) {
  await db.delete(habits).where(eq(habits.id, habitId));
  revalidatePath("/habits");
  revalidatePath("/today");
  revalidatePath("/timetable");
}

export async function setHabitLog(
  habitId: string,
  logDate: string,
  completed: boolean,
) {
  await db
    .insert(habitLogs)
    .values({ habitId, logDate, completed })
    .onConflictDoUpdate({
      target: [habitLogs.habitId, habitLogs.logDate],
      set: { completed },
    });

  revalidatePath("/habits");
  revalidatePath("/today");
}
