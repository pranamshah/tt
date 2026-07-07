"use server";

import { revalidatePath } from "next/cache";
import { addDays, format } from "date-fns";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { tags, taskTags, tasks } from "@/lib/db/schema";
import { getDefaultUserId } from "@/lib/db/default-user";
import { parseQuickAdd } from "@/lib/quick-add-parser";

async function resolveTagIds(userId: string, tagNames: string[]) {
  if (tagNames.length === 0) return [];

  const existing = await db
    .select()
    .from(tags)
    .where(and(eq(tags.userId, userId), inArray(tags.name, tagNames)));

  const existingNames = new Set(existing.map((t) => t.name));
  const missing = tagNames.filter((name) => !existingNames.has(name));

  const created = missing.length
    ? await db
        .insert(tags)
        .values(
          missing.map((name) => ({
            userId,
            name,
            color: "#516072",
          })),
        )
        .returning()
    : [];

  return [...existing, ...created].map((t) => t.id);
}

export async function quickAddTask(rawInput: string) {
  const trimmed = rawInput.trim();
  if (!trimmed) return;

  const userId = await getDefaultUserId();
  const parsed = parseQuickAdd(trimmed);

  if (!parsed.title) return;

  const [task] = await db
    .insert(tasks)
    .values({
      userId,
      title: parsed.title,
      dueDate: parsed.dueDate,
      dueTime: parsed.dueTime,
    })
    .returning({ id: tasks.id });

  const tagIds = await resolveTagIds(userId, parsed.tagNames);
  if (tagIds.length > 0) {
    await db
      .insert(taskTags)
      .values(tagIds.map((tagId) => ({ taskId: task.id, tagId })));
  }

  revalidatePath("/today");
}

export async function setTaskStatus(taskId: string, done: boolean) {
  await db
    .update(tasks)
    .set({
      status: done ? "done" : "todo",
      completedAt: done ? new Date() : null,
    })
    .where(eq(tasks.id, taskId));

  revalidatePath("/today");
}

export async function snoozeTaskToTomorrow(taskId: string) {
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  await db
    .update(tasks)
    .set({ dueDate: tomorrow })
    .where(eq(tasks.id, taskId));

  revalidatePath("/today");
}
